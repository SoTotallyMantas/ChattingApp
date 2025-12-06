using backend.Context;
using backend.Interfaces;
using backend.Models;
using Microsoft.EntityFrameworkCore;

namespace backend.Helper
{
    public class ServerHelper(VoxlockDbContext db) : IServerHelper
    {
        private readonly VoxlockDbContext _db = db;

        public async Task<Servers> GetServerOrThrowAsync(Guid serverGuid)
        {
            var server = await _db.Servers.FirstOrDefaultAsync(s => s.ServerGuid == serverGuid);
            if (server == null)
                throw new Exception("Server not found.");

            return server;
        }

        public async Task<Channels> GetChannelOrThrowAsync(Guid channelGuid)
        {
            var channel = await _db.Channels.FirstOrDefaultAsync(c => c.ChannelGuid == channelGuid);
            if (channel == null)
                throw new Exception("Channel not found.");

            return channel;
        }

        public async Task<ServerRoles> GetRoleOrThrowAsync(Guid roleGuid)
        {
            var role = await _db.ServerRoles.FirstOrDefaultAsync(r => r.RoleGuid == roleGuid);
            if (role == null)
                throw new Exception("Role not found.");

            return role;
        }

        public async Task<Users> GetUserOrThrowAsync(Guid userGuid)
        {
            var user = await _db.Users.FirstOrDefaultAsync(u => u.UserGuid == userGuid);
            if (user == null)
                throw new Exception("User not found.");

            return user;
        }
    }
}
