using backend.Context;
using backend.DTO.PermissionsResponseDtos;
using backend.DTO.RoleDtos;
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
    public class ServerRolesService(VoxlockDbContext db , IPermissionEvualuator perm, IServerHelper helper) : IServerRolesService
    {
        private readonly VoxlockDbContext _db = db;
        private readonly IPermissionEvualuator _perm = perm;
        private readonly IServerHelper _helper = helper;

        public async Task<List<ServerRoleResponseDto>> GetServerRolesAsync(Guid serverGuid, ClaimsPrincipal user)
        {
            Guid userGuid = user.GetUserGuid();

            await _perm.RequireServerMembership(serverGuid, userGuid);

            var roles = await _db.ServerRoles
                .Where(r => r.ServerGuid == serverGuid)
                .OrderBy(r => r.Position)
                .Include(r => r.RolePermissions)
                .ThenInclude(rp => rp.Permission)
                .ToListAsync();

            return roles.Select(MapRole).ToList();
        }

        public async Task<ServerRoleResponseDto> CreateRoleAsync(Guid serverGuid, CreateRoleRequestDto dto, ClaimsPrincipal user)
        {
            Guid userGuid = user.GetUserGuid();

            await _perm.RequirePermissionAsync(serverGuid, userGuid, AppPermissions.MANAGE_ROLES);

            var role = new ServerRoles
            {
                RoleGuid = Guid.NewGuid(),
                ServerGuid = serverGuid,
                RoleName = dto.RoleName,
                Color = dto.Color,
                IsAdmin = dto.IsAdmin,
                IsDefault = false,
                Position = dto.Position
            };

            _db.ServerRoles.Add(role);

            await _db.SaveChangesAsync();
            await _db.Entry(role)
                .Collection(r => r.RolePermissions)
                .Query()
                .Include(rp => rp.Permission)
                .LoadAsync();
            return MapRole(role);
        }


        public async Task<ServerRoleResponseDto> UpdateRoleAsync(Guid serverGuid,EditRoleRequestDto dto, ClaimsPrincipal user)
        {
            Guid userGuid = user.GetUserGuid();

            await _perm.RequirePermissionAsync(serverGuid, userGuid, AppPermissions.MANAGE_ROLES);
            
            var role = await _db.ServerRoles
                .Include(r => r.RolePermissions)
                    .ThenInclude(rp => rp.Permission)
                .FirstOrDefaultAsync(r => r.RoleGuid == dto.RoleGuid);

            if (role == null)
                throw new KeyNotFoundException("Role not found.");

            if (role.ServerGuid != serverGuid)
                throw new UnauthorizedAccessException("Role does not belong to this server.");

            if (role.IsDefault)
            {
                // Default role: only allow permission changes elsewhere; block rename/position/color edits
                throw new InvalidOperationException("Default role cannot be renamed or reordered.");
            }

            role.RoleName = dto.RoleName;
            role.Color = dto.RoleColor;
            role.Position = dto.Position;

            await _db.SaveChangesAsync();
            return MapRole(role);
        }

        public async Task DeleteServerRoleAsync(Guid serverGuid, Guid roleGuid, ClaimsPrincipal user)
        {
            Guid userGuid = user.GetUserGuid();

            await _perm.RequirePermissionAsync(serverGuid, userGuid, AppPermissions.MANAGE_ROLES);
            var role = await _helper.GetRoleOrThrowAsync(roleGuid);

            if (role.ServerGuid != serverGuid)
                throw new UnauthorizedAccessException("Role does not belong to this server.");

            if (role.IsDefault)
                throw new InvalidOperationException("Default role cannot be deleted.");

            
            var userRoles = _db.ServerUserRoles.Where(ur => ur.RoleGuid == roleGuid);
            _db.ServerUserRoles.RemoveRange(userRoles);

            
            var perms = _db.ServerRolePermissions.Where(p => p.RoleGuid == roleGuid);
            _db.ServerRolePermissions.RemoveRange(perms);

          
            _db.ServerRoles.Remove(role);

            await _db.SaveChangesAsync();
        }

        public async Task AssignRoleToUserAsync(Guid serverGuid, Guid roleGuid, AssignRoleRequestDto dto, ClaimsPrincipal user)
        {
            Guid userGuid = user.GetUserGuid();

            await _perm.RequirePermissionAsync(serverGuid, userGuid, AppPermissions.MANAGE_ROLES);

            var role = await _helper.GetRoleOrThrowAsync(roleGuid);

            if (role.ServerGuid != serverGuid)
                throw new UnauthorizedAccessException("Role does not belong to this server.");

           
            bool isMember = await _db.ServerMembers.AnyAsync(m =>
                m.ServerGuid == serverGuid && m.UserGuid == dto.UserGuid);

            if (!isMember)
                throw new Exception("User is not a member of this server.");

            bool alreadyHas = await _db.ServerUserRoles.AnyAsync(ur =>
                ur.ServerGuid == serverGuid &&
                ur.UserGuid == dto.UserGuid &&
                ur.RoleGuid == roleGuid);

            if (alreadyHas)
                return;

            _db.ServerUserRoles.Add(new ServerUserRoles
            {
                ServerGuid = serverGuid,
                UserGuid = dto.UserGuid,
                RoleGuid = roleGuid,
                AddedAt = DateTime.UtcNow
            });

            await _db.SaveChangesAsync();
        }

        public async Task RemoveRoleFromUserAsync(Guid serverGuid, Guid roleGuid, RemoveRoleRequestDto dto, ClaimsPrincipal user)
        {
            Guid userGuid = user.GetUserGuid();

            await _perm.RequirePermissionAsync(serverGuid, userGuid, AppPermissions.MANAGE_ROLES);

            var userRole = await _db.ServerUserRoles
                .FirstOrDefaultAsync(ur =>
                    ur.ServerGuid == serverGuid &&
                    ur.RoleGuid == roleGuid &&
                    ur.UserGuid == dto.UserGuid);

            if (userRole == null)
                return;

            _db.ServerUserRoles.Remove(userRole);
            await _db.SaveChangesAsync();
        }

       
        public async Task UpdateRolePermissionsAsync(Guid serverGuid, Guid roleGuid, UpdateRolePermissionsRequestDto dto, ClaimsPrincipal user)
        {
            Guid userGuid = user.GetUserGuid();

            await _perm.RequirePermissionAsync(serverGuid, userGuid, AppPermissions.MANAGE_ROLES);

            var role = await _helper.GetRoleOrThrowAsync(roleGuid);

            if (role.ServerGuid != serverGuid)
                throw new UnauthorizedAccessException("Role does not belong to this server.");

            
            var existing = _db.ServerRolePermissions.Where(p => p.RoleGuid == roleGuid);
            _db.ServerRolePermissions.RemoveRange(existing);

         
            foreach (var p in dto.PermissionsGuid)
            {
                _db.ServerRolePermissions.Add(new ServerRolePermissions
                {
                    RoleGuid = roleGuid,
                    PermissionsGuid = p
                });
            }

            await _db.SaveChangesAsync();
        }

        public async Task<List<ServerMemberResponseDto>> GetMembersWithRoleAsync(
            Guid serverGuid,
            Guid roleGuid,
            ClaimsPrincipal user)
        {
            Guid userGuid = user.GetUserGuid();

            
            await _perm.RequireServerMembership(serverGuid, userGuid);

            var role = await _db.ServerRoles
                .Include(r => r.RolePermissions)
                .ThenInclude(rp => rp.Permission)
                .FirstOrDefaultAsync(r => r.RoleGuid == roleGuid);

            if (role == null)
                throw new KeyNotFoundException("Role not found.");

            if (role.ServerGuid != serverGuid)
                throw new UnauthorizedAccessException("Role does not belong to this server.");

            
            var members = await _db.ServerUserRoles
                .Where(ur => ur.ServerGuid == serverGuid && ur.RoleGuid == roleGuid)
                .Include(ur => ur.User)
                .ToListAsync();

            var result = new List<ServerMemberResponseDto>();

            foreach (var ur in members)
            {
                var userEntity = ur.User;

                
                var userRoles = await _db.ServerUserRoles
                    .Where(r => r.ServerGuid == serverGuid && r.UserGuid == userEntity.UserGuid)
                    .Include(r => r.Role)
                    .ThenInclude(role => role.RolePermissions)
                    .ThenInclude(rp => rp.Permission)
                    .ToListAsync();

                result.Add(new ServerMemberResponseDto
                {
                    User = new UserResponseDto
                    {
                        UserGuid = userEntity.UserGuid,
                        UserName = userEntity.UserName,
                        DisplayName = userEntity.DisplayName,
                        AvatarKey = userEntity.AvatarKey
                    },

                    Roles = userRoles.Select(r => new ServerRoleResponseDto
                    {
                        RoleGuid = r.Role.RoleGuid,
                        RoleName = r.Role.RoleName,
                        Color = r.Role.Color,
                        Position = r.Role.Position,
                        IsDefault = r.Role.IsDefault,
                        Permissions = r.Role.RolePermissions.Select(p => new PermissionResponseDto
                        {
                            PermissionGuid = p.Permission.PermissionGuid,
                            PermissionName = p.Permission.Name,
                            Description = p.Permission.Description ?? "",
                            Category = p.Permission.Category
                        }).ToList()
                    }).ToList()
                });
            }

            return result;
        }
        public async Task ReorderRolesAsync(Guid serverGuid, ReorderRolesRequestDto dto, ClaimsPrincipal user)
        {
            Guid userGuid = user.GetUserGuid();

            await _perm.RequirePermissionAsync(serverGuid, userGuid, AppPermissions.MANAGE_ROLES);

            var roles = await _db.ServerRoles
                .Where(r => r.ServerGuid == serverGuid)
                .ToListAsync();

            foreach (var item in dto.Order)
            {
                var role = roles.FirstOrDefault(r => r.RoleGuid == item.RoleGuid);
                if (role != null)
                    role.Position = item.Position;
            }

            await _db.SaveChangesAsync();
        }

        private ServerRoleResponseDto MapRole(ServerRoles role)
        {
            return new ServerRoleResponseDto
            {
                RoleGuid = role.RoleGuid,
                RoleName = role.RoleName,
                Color = role.Color,
                IsAdmin = role.IsAdmin,
                IsDefault = role.IsDefault,
                Position = role.Position,
                Permissions = role.RolePermissions
                    .Select(rp => new PermissionResponseDto
                    {
                        PermissionGuid = rp.PermissionsGuid,
                        PermissionName = rp.Permission.Name,
                        Description = rp.Permission.Description ?? string.Empty,
                        Category = rp.Permission.Category
                    })
                    .ToList()
            };
        }
    }
}
