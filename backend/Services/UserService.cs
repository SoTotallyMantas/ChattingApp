using backend.Context;
using backend.Interfaces;
using Microsoft.EntityFrameworkCore;
using System.Linq;

namespace backend.Services
{
    public class UserService : IUserService
    {
        private readonly VoxlockDbContext _db;

        public UserService(VoxlockDbContext db)
        {
             _db = db;
        }

        public async Task<List<Guid>> GetServersForUserAsync(Guid userGuid)
        {
            return await _db.ServerMembers
                .Where(sm => sm.UserGuid == userGuid)
                .Select(sm => sm.ServerGuid)
                .ToListAsync();
            
        }

        public async Task<bool> isServerMemberAsync(Guid userGuid, Guid serverGuid)
        {
            return await _db.ServerMembers
                .AnyAsync(sm =>
                sm.UserGuid == userGuid &&
                sm.ServerGuid == serverGuid
            );
        }

        public async Task<bool> IsChannelMember(Guid userGuid, Guid channelGuid)
        {
            var serverGuid = await _db.Channels
                .Where(c => c.ChannelGuid == channelGuid)
                .Select(c => c.ServerGuid)
                .FirstOrDefaultAsync();
            if (serverGuid == Guid.Empty)
            {
                return false; 
            }
            return await isServerMemberAsync(userGuid, serverGuid);
        }

        public async Task<bool> HasChannelPermission(Guid userGuid, Guid channelGuid, string permission)
        {
            var serverGuid = await _db.Channels
                .Where(c => c.ChannelGuid == channelGuid)
                .Select(c => c.ServerGuid)
                .FirstOrDefaultAsync();

            if (serverGuid == Guid.Empty)
            {
                return false; 
            }

            var userRoles = await _db.ServerUserRoles
                .Where(sm => sm.UserGuid == userGuid && sm.ServerGuid == serverGuid)
                .Select(sm => sm.RoleGuid)
                .ToListAsync();

            if(userRoles.Count == 0)
            {
                return false;
            }

            return await _db.ServerRolePermissions
                .Where(rp => userRoles.Contains(rp.RoleGuid))
                .AnyAsync(rp => rp.Permission.Name == permission);
        }
    }
}
