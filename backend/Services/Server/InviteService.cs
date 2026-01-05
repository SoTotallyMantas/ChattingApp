using backend.Context;
using backend.DTO.InviteDtos;
using backend.DTO.UserDtos;
using backend.Extensions;
using backend.Helper;
using backend.Hubs;
using backend.Interfaces;
using backend.Models;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace backend.Services.Server
{
    public class InviteService(VoxlockDbContext db , IPermissionEvualuator perm, IServerHelper helper, IHubContext<ChatHub> hubContext) : IInviteService
    {
        private readonly VoxlockDbContext _db = db;
        private readonly IPermissionEvualuator _perm = perm;
        private readonly IServerHelper _helper = helper;
        private readonly IHubContext<ChatHub> _hubContext = hubContext;
        public async Task<InviteResponseDto> CreateInviteAsync(Guid serverGuid, CreateInviteRequestDto dto, ClaimsPrincipal user)
        {
            Guid userGuid = user.GetUserGuid();

            await _perm.RequirePermissionAsync(serverGuid, userGuid, AppPermissions.CREATE_INVITES);

            await _helper.GetServerOrThrowAsync(serverGuid);

            DateTime expiresAt = dto.ExpiresAt ?? DateTime.UtcNow.AddDays(1);
            int maxUses = dto.MaxUses <= 0 ? 1 : dto.MaxUses;

            var invite = new ServerInvites
            {
                InviteGuid = Guid.NewGuid(),
                ServerGuid = serverGuid,
                CreatedByGuid = userGuid,
                CreatedAt = DateTime.UtcNow,
                ExpiresAt = expiresAt,
                MaxUses = maxUses,
                Uses = 0
            };

            _db.ServerInvites.Add(invite);
            await _db.SaveChangesAsync();

            return MapInvite(invite);
        }


        public async Task JoinServerViaInviteAsync(Guid inviteGuid, ClaimsPrincipal user)
        {
            Guid userGuid = user.GetUserGuid();

            var invite = await _db.ServerInvites
                .Include(i => i.Server)
                .FirstOrDefaultAsync(i => i.InviteGuid == inviteGuid);

            if (invite == null)
                throw new KeyNotFoundException("Invite not found.");

            
            if (invite.ExpiresAt < DateTime.UtcNow)
                throw new InvalidOperationException("Invite has expired.");

            
            if (invite.Uses >= invite.MaxUses)
                throw new InvalidOperationException("Invite has reached its maximum number of uses.");

           
            var ban = await _db.ServerBans
                .FirstOrDefaultAsync(b => b.ServerGuid == invite.ServerGuid && b.UserGuid == userGuid);

            if (ban != null)
            {
                var reason = string.IsNullOrWhiteSpace(ban.Reason)
                    ? "No reason provided."
                    : ban.Reason;
                throw new InvalidOperationException($"You are banned from this server. Reason: {reason}");
            }

            
            bool alreadyMember = await _db.ServerMembers
                .AnyAsync(m => m.ServerGuid == invite.ServerGuid && m.UserGuid == userGuid);

            var membershipAdded = false;
            if (!alreadyMember)
            {
                var membership = new ServerMembers
                {
                    ServerGuid = invite.ServerGuid,
                    UserGuid = userGuid,
                    JoinedAt = DateTime.UtcNow
                };

                _db.ServerMembers.Add(membership);
                membershipAdded = true;

                var defaultRoleGuid = await _db.ServerRoles
                    .Where(r => r.ServerGuid == invite.ServerGuid && r.IsDefault)
                    .Select(r => r.RoleGuid)
                    .FirstOrDefaultAsync();
                if (defaultRoleGuid != Guid.Empty)
                {
                    bool alreadyHasDefault = await _db.ServerUserRoles.AnyAsync(ur =>
                        ur.ServerGuid == invite.ServerGuid &&
                        ur.UserGuid == userGuid &&
                        ur.RoleGuid == defaultRoleGuid);
                    if (!alreadyHasDefault)
                    {
                        _db.ServerUserRoles.Add(new ServerUserRoles
                        {
                            ServerGuid = invite.ServerGuid,
                            UserGuid = userGuid,
                            RoleGuid = defaultRoleGuid,
                            AddedAt = DateTime.UtcNow
                        });
                    }
                }
            }

            
            invite.Uses++;

            await _db.SaveChangesAsync();
            if (membershipAdded)
            {
                await _hubContext.Clients
                    .Group($"server-{invite.ServerGuid}")
                    .SendAsync("ServerMembersUpdated", new { serverGuid = invite.ServerGuid });
            }
        }

        public async Task<List<InviteResponseDto>> GetInvitesAsync(Guid serverGuid, ClaimsPrincipal user)
        {
            Guid userGuid = user.GetUserGuid();

            await _perm.RequirePermissionAsync(serverGuid, userGuid, AppPermissions.CREATE_INVITES);

            var invites = await _db.ServerInvites
                .Where(i => i.ServerGuid == serverGuid)
                .ToListAsync();

            var now = DateTime.UtcNow;
            var expired = invites.Where(i => i.ExpiresAt < now || i.Uses >= i.MaxUses).ToList();
            if (expired.Count > 0)
            {
                _db.ServerInvites.RemoveRange(expired);
                await _db.SaveChangesAsync();
                invites = invites.Except(expired).ToList();
            }

            return invites.Select(MapInvite).ToList();
        }

       
        public async Task RevokeInviteAsync( Guid inviteGuid, ClaimsPrincipal user)
        {
            Guid userGuid = user.GetUserGuid();

            var invite = await _db.ServerInvites
                .FirstOrDefaultAsync(i => i.InviteGuid == inviteGuid);

            if (invite == null)
            {
                throw new KeyNotFoundException("Invite not found.");
            }

                await _perm.RequirePermissionAsync(invite.ServerGuid, userGuid, AppPermissions.CREATE_INVITES);

           
            _db.ServerInvites.Remove(invite);
            await _db.SaveChangesAsync();
        }


        private InviteResponseDto MapInvite(ServerInvites invite)
        {
            return new InviteResponseDto
            {
                InviteGuid = invite.InviteGuid,
                ServerGuid = invite.ServerGuid,
                CreatedAt = invite.CreatedAt,
                ExpiresAt = invite.ExpiresAt,
                MaxUses = invite.MaxUses,
                Uses = invite.Uses
            };
        }
    }
}
