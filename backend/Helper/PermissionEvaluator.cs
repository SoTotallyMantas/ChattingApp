using backend.Context;
using backend.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace backend.Helper
{
    public class PermissionEvaluator(VoxlockDbContext db) : IPermissionEvualuator
    {
        private readonly VoxlockDbContext _db = db;

        public async Task<bool> HasPermissionAsync(Guid serverGuid,Guid userGuid, string permission)
        {
           
            var server = await _db.Servers.FirstOrDefaultAsync(s => s.ServerGuid == serverGuid);
            
            if (server == null)
            {
                return false;
            }
            
            if (server.OwnerGuid == userGuid)
            {
                return true;
            }
           
            var roles = await _db.ServerUserRoles
                .Where(r => r.ServerGuid == serverGuid && r.UserGuid == userGuid)
                .Include(r => r.Role)
                .ThenInclude(r => r.RolePermissions)
                .ToListAsync();

           
     
            var perm = await _db.Permissions.FirstOrDefaultAsync(p => p.Name == permission);
            if(perm == null)
            {
                return false;
            }

            Guid permGuid = perm.PermissionGuid;

            return roles.Any(r => r.Role.RolePermissions.Any(rp => rp.PermissionsGuid == permGuid));
        }

        public async Task RequirePermissionAsync(Guid serverGuid,Guid userGuid, string permission)
        {
            bool has = await HasPermissionAsync(serverGuid,userGuid, permission);
            
          
            if(!has)
            {
                throw new UnauthorizedAccessException($"Missing permission: {permission}");

            }

        }

        public async Task RequireServerMembership(Guid serverGuid,Guid userGuid)
        {
            bool isMember = await _db.ServerMembers
                .AnyAsync(sm => sm.ServerGuid == serverGuid && sm.UserGuid == userGuid);

            if (!isMember)
                throw new UnauthorizedAccessException("Not a server member.");
        }
    }
}
