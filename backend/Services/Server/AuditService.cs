using backend.Context;
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
    public class AuditService : IAuditService
    {
        private readonly VoxlockDbContext _db;
        private readonly IPermissionEvualuator _perm;
        private readonly IServerHelper _helper;

        public AuditService(
            VoxlockDbContext db,
            IPermissionEvualuator perm,
            IServerHelper helper)
        {
            _db = db;
            _perm = perm;
            _helper = helper;
        }

       
        public async Task AddAuditLogAsync(Guid serverGuid, Guid performedByGuid, string action)
        {
           
            await _helper.GetServerOrThrowAsync(serverGuid);

            var entry = new ServerAuditLog
            {
                AuditGuid = Guid.NewGuid(),
                ServerGuid = serverGuid,
                PerformedBy = performedByGuid,
                Action = action,
                Timestamp = DateTime.UtcNow
            };

            _db.AuditLog.Add(entry);
            await _db.SaveChangesAsync();
        }

        
        public async Task<List<ServerAuditLogEntryResponseDto>> GetServerAuditLogsAsync( Guid serverGuid,ClaimsPrincipal user)
        {
            Guid userGuid = user.GetUserGuid();

           
            await _perm.RequireServerMembership(serverGuid, userGuid);

            
            await _perm.RequirePermissionAsync(serverGuid, userGuid, AppPermissions.VIEW_AUDIT_LOG);

            var logs = await _db.AuditLog
                .Where(a => a.ServerGuid == serverGuid)
                .Include(a => a.PerformedByUser)
                .OrderByDescending(a => a.Timestamp)
                .Take(2500)
                .ToListAsync();

            return logs.Select(Map).ToList();
        }

        private ServerAuditLogEntryResponseDto Map(ServerAuditLog a)
        {
            return new ServerAuditLogEntryResponseDto
            {
                AuditLogEntryGuid = a.AuditGuid,
                ServerGuid = a.ServerGuid,
                PerformedByGuid = a.PerformedBy,
                Action = a.Action,
                PerformedAt = a.Timestamp,
                PerformedBy = MapUser(a.PerformedByUser)
            };
        }

        public UserResponseDto MapUser(Users user)
        {
            return new UserResponseDto
            {
                UserGuid = user.UserGuid,
                UserName = user.UserName,
                DisplayName = user.DisplayName,   
                AvatarUrl = user.AvatarURL
            };
        }
    }
}
