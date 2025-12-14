using backend.Context;
using backend.DTO.ServerDtos;
using backend.Extensions;
using backend.Helper;
using backend.Interfaces;
using backend.Models;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace backend.Services.Server
{
    public class ServerService(VoxlockDbContext db,IPermissionService perm,IServerHelper helper, IS3StorageService storage) : IServerService
    {

        private readonly VoxlockDbContext _db = db;
        private readonly IPermissionService _perm = perm;
        private readonly IServerHelper _helper = helper;
        private readonly IS3StorageService _storage = storage;

        public async Task<List<ServerResponseDto>> GetMyServersAsync(ClaimsPrincipal user)
        {
            Guid userGuid = user.GetUserGuid();

            var servers = await _db.ServerMembers
                .Where(m => m.UserGuid == userGuid)
                .Select(m => m.server)
                .ToListAsync();

            return servers.Select(MapServer).ToList();
        }


        public async Task<ServerResponseDto> GetServerByGuidAsync(Guid serverGuid, ClaimsPrincipal user)
        {
            Guid userGuid = user.GetUserGuid();

            await _perm.RequireMembership(serverGuid, userGuid);

            var server = await _db.Servers.FirstOrDefaultAsync(s => s.ServerGuid == serverGuid);
            if (server == null)
                throw new Exception("Server not found.");

            return MapServer(server);
        }

        public async Task<ServerResponseDto> CreateServerAsync(CreateServerRequestDto dto, ClaimsPrincipal user)
        {
            Guid userGuid = user.GetUserGuid();

            var server = new Servers
            {
                ServerGuid = Guid.NewGuid(),
                ServerName = dto.ServerName,
                IconKey = dto.IconKey,
                OwnerGuid = userGuid,
                CreatedAt = DateTime.UtcNow,
            };

            _db.Servers.Add(server);
            await _db.SaveChangesAsync();

            var ownerRole = new ServerRoles
            {
                RoleGuid = Guid.NewGuid(),
                ServerGuid = server.ServerGuid,
                RoleName = "Owner",
                Color = "#FF8800",
                IsAdmin = true,
                IsDefault = false,
                Position = 1000 
            };

            _db.ServerRoles.Add(ownerRole);
            await _db.SaveChangesAsync();

            foreach (var perm in AppPermissions.All)
            {
                _db.ServerRolePermissions.Add(new ServerRolePermissions
                {
                    RoleGuid = ownerRole.RoleGuid,
                    PermissionsGuid = await _db.Permissions
                        .Where(p => p.Name == perm)
                        .Select(p => p.PermissionGuid)
                        .FirstAsync()
                });
            }
            await _db.SaveChangesAsync();
            // Default member role
            var defaultRole = new ServerRoles
            {
                RoleGuid = Guid.NewGuid(),
                ServerGuid = server.ServerGuid,
                RoleName = "Default",
                Color = "#5865F2",
                IsAdmin = false,
                IsDefault = true,
                Position = 100
            };

            _db.ServerRoles.Add(defaultRole);
            await _db.SaveChangesAsync();

            var defaultPerms = new[] { AppPermissions.VIEW_SERVER, AppPermissions.SEND_MESSAGES };
            foreach (var perm in defaultPerms)
            {
                _db.ServerRolePermissions.Add(new ServerRolePermissions
                {
                    RoleGuid = defaultRole.RoleGuid,
                    PermissionsGuid = await _db.Permissions
                        .Where(p => p.Name == perm)
                        .Select(p => p.PermissionGuid)
                        .FirstAsync()
                });
            }
            await _db.SaveChangesAsync();

            _db.ServerUserRoles.Add(new ServerUserRoles
            {
                ServerGuid = server.ServerGuid,
                UserGuid = userGuid,
                RoleGuid = ownerRole.RoleGuid,
                AddedAt = DateTime.UtcNow
            });
            _db.ServerUserRoles.Add(new ServerUserRoles
            {
                ServerGuid = server.ServerGuid,
                UserGuid = userGuid,
                RoleGuid = defaultRole.RoleGuid,
                AddedAt = DateTime.UtcNow
            });

            await _db.SaveChangesAsync();

            _db.ServerMembers.Add(new ServerMembers
            {
                ServerGuid = server.ServerGuid,
                UserGuid = userGuid,
                JoinedAt = DateTime.UtcNow,
            });



            await _db.SaveChangesAsync();

            return MapServer(server);
        }


        public async Task<ServerResponseDto> UpdateServerAsync(Guid serverGuid, EditServerRequestDto dto, ClaimsPrincipal user)
        {
            Guid userGuid = user.GetUserGuid();

            var server = await _helper.GetServerOrThrowAsync(serverGuid);

            if (server.OwnerGuid != userGuid)
                throw new UnauthorizedAccessException("Only the server owner can modify the server.");

            server.ServerName = dto.ServerName;
            server.IconKey = dto.IconKey;

            await _db.SaveChangesAsync();

            return MapServer(server);
        }

        public async Task DeleteServerAsync(Guid serverGuid, ClaimsPrincipal user)
        {
            Guid userGuid = user.GetUserGuid();

            var server = await _helper.GetServerOrThrowAsync(serverGuid);

            if (server.OwnerGuid != userGuid)
                throw new UnauthorizedAccessException("Only the server owner can delete the server.");

            _db.Servers.Remove(server);
            await _db.SaveChangesAsync();
        }

        public async Task LeaveServerAsync(Guid serverGuid, ClaimsPrincipal user)
        {
            Guid userGuid = user.GetUserGuid();

            var membership = await _db.ServerMembers
                 .FirstOrDefaultAsync(m => m.ServerGuid == serverGuid && m.UserGuid == userGuid);
            if (membership == null)
                throw new UnauthorizedAccessException("You are not a member of this server.");

            var server = await _helper.GetServerOrThrowAsync(serverGuid);

           
            if (server.OwnerGuid == userGuid)
                throw new InvalidOperationException("Server owner cannot leave the server. Transfer ownership or delete the server.");

            
            var roles = _db.ServerUserRoles
                .Where(r => r.ServerGuid == serverGuid && r.UserGuid == userGuid);

            _db.ServerUserRoles.RemoveRange(roles);

            
            _db.ServerMembers.Remove(membership);

            
            var voiceState = await _db.VoiceStates
                .FirstOrDefaultAsync(v => v.UserGuid == userGuid && v.ChannelGuid == serverGuid);

            if (voiceState != null)
                _db.VoiceStates.Remove(voiceState);

            
            bool noMembersLeft = !await _db.ServerMembers.AnyAsync(m => m.ServerGuid == serverGuid);
            if (noMembersLeft)
                _db.Servers.Remove(server);

            await _db.SaveChangesAsync();
        }

        public async Task<(Stream stream, string contentType)?> GetServerIconAsync(Guid serverGuid, CancellationToken ct)
        {
            var server = await _db.Servers.AsNoTracking().FirstOrDefaultAsync(s => s.ServerGuid == serverGuid, ct);
            if (server?.IconKey == null) return null;
            return await _storage.DownloadAsync(server.IconKey, ct);
        }

        public async Task<string> UploadServerIconAsync(Guid serverGuid, ClaimsPrincipal user, Stream fileStream, string contentType, CancellationToken ct)
        {
            Guid userGuid = user.GetUserGuid();

            var server = await _helper.GetServerOrThrowAsync(serverGuid);
            if (server.OwnerGuid != userGuid)
            {
                await _perm.RequireAsync(serverGuid, userGuid, AppPermissions.MANAGE_SERVER);
            }

            var newKey = StorageKeyGenerator.ServerIcon(serverGuid);
            var oldKey = server.IconKey;

            await _storage.UploadAsync(newKey, fileStream, contentType, ct);

            if (!string.IsNullOrEmpty(oldKey) && oldKey != newKey)
            {
                try { await _storage.DeleteAsync(oldKey, ct); } catch { /* best effort */ }
            }

            server.IconKey = newKey;
            await _db.SaveChangesAsync(ct);

            return newKey;
        }

        private ServerResponseDto MapServer(Servers s)
        {
            return new ServerResponseDto
            {
                ServerGuid = s.ServerGuid,
                ServerName = s.ServerName,
                OwnerGuid = s.OwnerGuid,
                IconKey = s.IconKey,
                
            };
        }
    }
}
