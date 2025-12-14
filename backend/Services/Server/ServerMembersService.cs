using backend.Context;
using backend.DTO.KickBanDtos;
using backend.DTO.PermissionsResponseDtos;
using backend.DTO.ServerDtos;
using backend.DTO.UserDtos;
using backend.Extensions;
using backend.Helper;
using backend.Interfaces;
using backend.Models;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace backend.Services.Server
{
    public class ServerMembersService(VoxlockDbContext db, IPermissionEvualuator perm, IServerHelper helper) : IServerMemberService
    {
        private readonly VoxlockDbContext _db = db;
        private readonly IPermissionEvualuator _perm = perm;
        private readonly IServerHelper _helper = helper;

        public async Task<List<BanResponseDto>> GetServerBansAsync(Guid serverGuid, ClaimsPrincipal user)
        {
            Guid userGuid = user.GetUserGuid();

          
            await _perm.RequireServerMembership(serverGuid, userGuid);

      
            await _perm.RequirePermissionAsync(serverGuid, userGuid, AppPermissions.BAN_MEMBERS);

            var bans = await _db.ServerBans
                .Where(b => b.ServerGuid == serverGuid)
                .Include(b => b.User)
                .Include(b => b.BannedByUser)
                .ToListAsync();

            return bans.Select(b => new BanResponseDto
            {
                BanGuid = b.BanGuid,
                User = new UserResponseDto
                {
                    UserGuid = b.User?.UserGuid ?? Guid.Empty,
                    UserName = b.User?.UserName ?? "Deleted User",
                    DisplayName = b.User?.UserName ?? "Deleted User",
                    AvatarKey = b.User?.AvatarKey
                },
                BannedBy = new UserResponseDto
                {
                    UserGuid = b.BannedByUser?.UserGuid ?? Guid.Empty,
                    UserName = b.BannedByUser?.UserName ?? "Deleted User",
                    DisplayName = b.BannedByUser?.UserName ?? "Deleted User",
                    AvatarKey = b.BannedByUser?.AvatarKey
                },
                Reason = b.Reason,
                CreatedAt = b.CreatedAt
            }).ToList();
        }
        public async Task<List<ServerMemberResponseDto>> GetServerMembersAsync(Guid serverGuid, ClaimsPrincipal user)
        {
            Guid userGuid = user.GetUserGuid();
            await _perm.RequireServerMembership(serverGuid, userGuid);

            var members = await _db.ServerMembers
                .Where(x => x.ServerGuid == serverGuid)
                .Include(m => m.User)
                .Include(m => m.User.ServerUserRoles)
                    .ThenInclude(ur => ur.Role)
                        .ThenInclude(r => r.RolePermissions)
                            .ThenInclude(rp => rp.Permission)
                .ToListAsync();

            return members.Select(MapMember).ToList();
        }

  
        public async Task KickUserFromServerAsync(Guid serverGuid, KickMemberRequestDto dto, ClaimsPrincipal user)
        {
            Guid userGuid = user.GetUserGuid();

            await _perm.RequirePermissionAsync(serverGuid, userGuid, AppPermissions.KICK_MEMBERS);

            if (dto.UserGuid == userGuid)
                throw new InvalidOperationException("You cannot kick yourself.");

            var membership = await _db.ServerMembers
                .FirstOrDefaultAsync(m => m.ServerGuid == serverGuid && m.UserGuid == dto.UserGuid);

            if (membership == null)
                throw new InvalidOperationException("User is not a member of this server.");

            _db.ServerMembers.Remove(membership);

            // Remove roles assigned to user
            var roles = _db.ServerUserRoles
                .Where(r => r.ServerGuid == serverGuid && r.UserGuid == dto.UserGuid);

            _db.ServerUserRoles.RemoveRange(roles);

            await _db.SaveChangesAsync();
        }

      
        public async Task BanUserFromServerAsync(Guid serverGuid, BanMemberRequestDto dto, ClaimsPrincipal user)
        {
            Guid userGuid = user.GetUserGuid();

            await _perm.RequirePermissionAsync(serverGuid, userGuid, AppPermissions.BAN_MEMBERS);

            if (dto.UserGuid == userGuid)
                throw new InvalidOperationException("You cannot ban yourself.");

            // Remove membership if exists
            var membership = await _db.ServerMembers
                .FirstOrDefaultAsync(m => m.ServerGuid == serverGuid && m.UserGuid == dto.UserGuid);

            if (membership != null)
                _db.ServerMembers.Remove(membership);

            // Remove role assignments
            var roles = _db.ServerUserRoles
                .Where(r => r.ServerGuid == serverGuid && r.UserGuid == dto.UserGuid);

            _db.ServerUserRoles.RemoveRange(roles);

            // Add ban entry
            var ban = new ServerBans
            {
                BanGuid = Guid.NewGuid(),
                ServerGuid = serverGuid,
                UserGuid = dto.UserGuid,
                BannedByGuid = userGuid,
                Reason = dto.Reason,
                CreatedAt = DateTime.UtcNow
            };

            _db.ServerBans.Add(ban);

            await _db.SaveChangesAsync();
        }

       
        public async Task UnbanUserFromServerAsync(Guid serverGuid, UnbanMemberRequestDto dto, ClaimsPrincipal user)
        {
            Guid userGuid = user.GetUserGuid();

            await _perm.RequirePermissionAsync(serverGuid, userGuid, AppPermissions.BAN_MEMBERS);

            var ban = await _db.ServerBans
                .FirstOrDefaultAsync(b => b.ServerGuid == serverGuid && b.UserGuid == dto.UserGuid);

            if (ban == null)
                throw new InvalidOperationException("User is not banned.");

            _db.ServerBans.Remove(ban);
            await _db.SaveChangesAsync();
        }

      

        private ServerMemberResponseDto MapMember(ServerMembers member)
        {
            var user = member.User;

            var roles = user.ServerUserRoles
                .Where(r => r.ServerGuid == member.ServerGuid)
                .Select(r => MapRole(r.Role))
                .ToList();

            return new ServerMemberResponseDto
            {
                User = new UserResponseDto
                {
                    UserGuid = user.UserGuid,
                    DisplayName = user.DisplayName,
                    UserName = user.UserName,
                    AvatarKey = user.AvatarKey
                },
                Roles = roles
            };
        }
        private ServerRoleResponseDto MapRole(ServerRoles role)
        {
            return new ServerRoleResponseDto
            {
                RoleGuid = role.RoleGuid,
                RoleName = role.RoleName,
                Color = role.Color,
                Position = role.Position,
                IsDefault = role.IsDefault,
                Permissions = role.RolePermissions
                    .Select(rp => new PermissionResponseDto
                    {
                        PermissionGuid = rp.Permission.PermissionGuid,      
                        PermissionName = rp.Permission.Name,
                        Description = rp.Permission.Description ?? string.Empty,
                        Category = rp.Permission.Category
                    })
                    .ToList()
            };
        }
    }
}
