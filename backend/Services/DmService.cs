using backend.Context;
using backend.DTO.ChannelDtos;
using backend.DTO.DmDtos;
using backend.DTO.UserDtos;
using backend.Helper;
using backend.Interfaces;
using backend.Models;
using Microsoft.EntityFrameworkCore;

namespace backend.Services
{
    public class DmService(VoxlockDbContext db) : IDmService
    {
        private readonly VoxlockDbContext _db = db;

        public async Task<DmThreadResponseDto> GetOrCreateDmAsync(Guid userGuid, Guid friendGuid)
        {
            if (friendGuid == Guid.Empty)
                throw new ArgumentException("Friend is required.");
            if (userGuid == friendGuid)
                throw new ArgumentException("Cannot start a DM with yourself.");

            var friendship = await _db.Friendships
                .Include(f => f.Requester)
                .Include(f => f.Addressee)
                .FirstOrDefaultAsync(f =>
                    f.Status == FriendshipStatuses.Accepted &&
                    ((f.RequesterGuid == userGuid && f.AddresseeGuid == friendGuid) ||
                     (f.RequesterGuid == friendGuid && f.AddresseeGuid == userGuid)));

            if (friendship == null)
                throw new UnauthorizedAccessException("Users are not friends.");

            var friendUser = friendship.RequesterGuid == userGuid
                ? friendship.Addressee
                : friendship.Requester;

            var existing = await _db.Servers
                .Where(s => s.Members.Any(m => m.UserGuid == userGuid))
                .Where(s => s.Members.Any(m => m.UserGuid == friendGuid))
                .Where(s => s.Members.Count() == 2)
                .Where(s => s.Channels.Count() == 1 && s.Channels.Any(c => c.Type == "dm"))
                .Select(s => new DmServerSnapshot
                {
                    ServerGuid = s.ServerGuid,
                    OwnerGuid = s.OwnerGuid,
                    IconKey = s.IconKey,
                    Channel = s.Channels
                        .Where(c => c.Type == "dm")
                        .Select(c => new DmChannelSnapshot
                        {
                            ChannelGuid = c.ChannelGuid,
                            ServerGuid = c.ServerGuid,
                            ChannelName = c.ChannelName,
                            ChannelType = c.Type,
                            ParentGuid = c.ParentGuid,
                            Position = c.Position
                        })
                        .FirstOrDefault()
                })
                .FirstOrDefaultAsync();

            if (existing?.Channel != null)
            {
                return Map(existing, friendUser);
            }

            var serverGuid = Guid.NewGuid();
            var ownerRoleGuid = Guid.NewGuid();
            var defaultRoleGuid = Guid.NewGuid();
            var channelGuid = Guid.NewGuid();

            var server = new Servers
            {
                ServerGuid = serverGuid,
                ServerName = "Direct Message",
                IconKey = null,
                OwnerGuid = userGuid,
                CreatedAt = DateTime.UtcNow,
            };

            var ownerRole = new ServerRoles
            {
                RoleGuid = ownerRoleGuid,
                ServerGuid = serverGuid,
                RoleName = "Owner",
                Color = "#FF8800",
                IsAdmin = true,
                IsDefault = false,
                Position = 0
            };

            var defaultRole = new ServerRoles
            {
                RoleGuid = defaultRoleGuid,
                ServerGuid = serverGuid,
                RoleName = "Default",
                Color = "#5865F2",
                IsAdmin = false,
                IsDefault = true,
                Position = int.MaxValue
            };

            var channel = new Channels
            {
                ChannelGuid = channelGuid,
                ServerGuid = serverGuid,
                ChannelName = "Direct Message",
                ParentGuid = null,
                Position = 0,
                Type = "dm"
            };

            _db.Servers.Add(server);
            _db.ServerRoles.AddRange(ownerRole, defaultRole);
            _db.Channels.Add(channel);

            var permissionMap = await _db.Permissions
                .Where(p => AppPermissions.All.Contains(p.Name))
                .ToDictionaryAsync(p => p.Name, p => p.PermissionGuid);

            foreach (var perm in AppPermissions.All)
            {
                _db.ServerRolePermissions.Add(new ServerRolePermissions
                {
                    RoleGuid = ownerRoleGuid,
                    PermissionsGuid = permissionMap[perm]
                });
            }

            var defaultPerms = new[] { AppPermissions.SEND_MESSAGES };
            foreach (var perm in defaultPerms)
            {
                _db.ServerRolePermissions.Add(new ServerRolePermissions
                {
                    RoleGuid = defaultRoleGuid,
                    PermissionsGuid = permissionMap[perm]
                });
            }

            _db.ServerUserRoles.AddRange(
                new ServerUserRoles
                {
                    ServerGuid = serverGuid,
                    UserGuid = userGuid,
                    RoleGuid = ownerRoleGuid,
                    AddedAt = DateTime.UtcNow
                },
                new ServerUserRoles
                {
                    ServerGuid = serverGuid,
                    UserGuid = userGuid,
                    RoleGuid = defaultRoleGuid,
                    AddedAt = DateTime.UtcNow
                },
                new ServerUserRoles
                {
                    ServerGuid = serverGuid,
                    UserGuid = friendGuid,
                    RoleGuid = defaultRoleGuid,
                    AddedAt = DateTime.UtcNow
                }
            );

            _db.ServerMembers.AddRange(
                new ServerMembers
                {
                    ServerGuid = serverGuid,
                    UserGuid = userGuid,
                    JoinedAt = DateTime.UtcNow
                },
                new ServerMembers
                {
                    ServerGuid = serverGuid,
                    UserGuid = friendGuid,
                    JoinedAt = DateTime.UtcNow
                }
            );

            await _db.SaveChangesAsync();

            return Map(new DmServerSnapshot
            {
                ServerGuid = server.ServerGuid,
                OwnerGuid = server.OwnerGuid,
                IconKey = server.IconKey,
                Channel = new DmChannelSnapshot
                {
                    ChannelGuid = channel.ChannelGuid,
                    ServerGuid = channel.ServerGuid,
                    ChannelName = channel.ChannelName,
                    ChannelType = channel.Type,
                    ParentGuid = channel.ParentGuid,
                    Position = channel.Position
                }
            }, friendUser);
        }

        private static DmThreadResponseDto Map(DmServerSnapshot server, Users friendUser)
        {
            var friendDisplay = string.IsNullOrWhiteSpace(friendUser.DisplayName)
                ? friendUser.UserName
                : friendUser.DisplayName;

            return new DmThreadResponseDto
            {
                Server = new DmServerResponseDto
                {
                    ServerGuid = server.ServerGuid,
                    ServerName = friendDisplay,
                    OwnerGuid = server.OwnerGuid,
                    IconKey = server.IconKey,
                    IsDirect = true
                },
                Channel = new ChannelResponseDto
                {
                    ChannelGuid = server.Channel!.ChannelGuid,
                    ServerGuid = server.Channel.ServerGuid,
                    ChannelName = friendDisplay,
                    ChannelType = server.Channel.ChannelType,
                    ParentGuid = server.Channel.ParentGuid,
                    Position = server.Channel.Position
                },
                Friend = new UserResponseDto
                {
                    UserGuid = friendUser.UserGuid,
                    UserName = friendUser.UserName,
                    DisplayName = friendDisplay,
                    AvatarKey = friendUser.AvatarKey,
                    Presence = friendUser.Status
                }
            };
        }

        private sealed class DmServerSnapshot
        {
            public Guid ServerGuid { get; set; }
            public Guid OwnerGuid { get; set; }
            public string? IconKey { get; set; }
            public DmChannelSnapshot? Channel { get; set; }
        }

        private sealed class DmChannelSnapshot
        {
            public Guid ChannelGuid { get; set; }
            public Guid ServerGuid { get; set; }
            public string ChannelName { get; set; } = string.Empty;
            public string ChannelType { get; set; } = string.Empty;
            public Guid? ParentGuid { get; set; }
            public int Position { get; set; }
        }
    }
}
