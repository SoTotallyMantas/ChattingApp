using backend.Context;
using Microsoft.EntityFrameworkCore;

namespace backend.Helper
{
    public class CheckHierarchy
    {
        private readonly VoxlockDbContext _db;
        public CheckHierarchy(VoxlockDbContext db)
        {
            _db = db;
        }

        public async Task<int> GetRoleLowestPositionAsync(Guid serverGuid, Guid userGuid)
        {
            var positions = await _db.ServerUserRoles
                .Where(r => r.ServerGuid == serverGuid && r.UserGuid == userGuid)
                .Select(r => r.Role.IsDefault ? int.MaxValue : r.Role.Position)
                .ToListAsync();

            if (positions.Count == 0)
                return int.MaxValue;

            return positions.Min();
        }
        public async Task<HashSet<Guid>> GetUserPermissionGuidsAsync(Guid serverGuid, Guid userGuid)
        {
            var perms = await _db.ServerUserRoles
                .Where(r => r.ServerGuid == serverGuid && r.UserGuid == userGuid)
                .SelectMany(r => r.Role.RolePermissions.Select(rp => rp.PermissionsGuid))
                .ToListAsync();

            return perms.ToHashSet();
        }
    }
}
