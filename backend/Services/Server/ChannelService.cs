using backend.Context;
using backend.DTO.ChannelDtos;
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
    public class ChannelService(VoxlockDbContext db, IPermissionEvualuator perm, IServerHelper helper, IHubContext<ChatHub> hubContext) : IChannelService
    {
        private readonly VoxlockDbContext _db = db;
        private readonly IPermissionEvualuator _perm = perm;
        private readonly IServerHelper _helper = helper;
        private readonly IHubContext<ChatHub> _hubContext = hubContext;


        public async Task<ChannelResponseDto> CreateChannelAsync(Guid serverGuid, CreateChannelRequestDto dto, ClaimsPrincipal user)
        {
            Guid userGuid = user.GetUserGuid();

            
            await _perm.RequirePermissionAsync(serverGuid, userGuid, AppPermissions.MANAGE_CHANNELS);
           


            await _helper.GetServerOrThrowAsync(serverGuid);

            var channel = new Channels
            {
                ChannelGuid = Guid.NewGuid(),
                ServerGuid = serverGuid,
                ChannelName = dto.ChannelName,
                Type = dto.ChannelType,
                ParentGuid = dto.ParentGuid,
                Position = dto.Position,
           
            };

            _db.Channels.Add(channel);
            await _db.SaveChangesAsync();

            await _hubContext.Clients
                .Group($"server-{serverGuid}")
                .SendAsync("ServerChannelsUpdated", new { serverGuid, channelGuid = channel.ChannelGuid, action = "created" });

            return MapChannel(channel);
        }

       
        public async Task<List<ChannelResponseDto>> GetChannelsAsync(Guid serverGuid, ClaimsPrincipal user)
        {
            Guid userGuid = user.GetUserGuid();
            await _perm.RequireServerMembership(serverGuid, userGuid);

            var channels = await _db.Channels
                .Where(c => c.ServerGuid == serverGuid)
                .OrderBy(c => c.Position)
                .ThenBy(c => c.ChannelName)
                .ToListAsync();

            return channels.Select(MapChannel).ToList();
        }

    
        public async Task<ChannelResponseDto> GetChannelByGuidAsync(Guid channelGuid, ClaimsPrincipal user)
        {
            var channel = await _helper.GetChannelOrThrowAsync(channelGuid);

            Guid userGuid = user.GetUserGuid();
            await _perm.RequireServerMembership(channel.ServerGuid, userGuid);

            return MapChannel(channel);
        }

    
        public async Task<ChannelResponseDto> UpdateChannelAsync(Guid serverGuid, Guid channelGuid, EditChannelRequestDto dto, ClaimsPrincipal user)
        {
            Guid userGuid = user.GetUserGuid();

            await _perm.RequirePermissionAsync(serverGuid, userGuid, AppPermissions.MANAGE_CHANNELS);

            var channel = await _helper.GetChannelOrThrowAsync(channelGuid);

            if (channel.ServerGuid != serverGuid)
                throw new UnauthorizedAccessException("Channel does not belong to this server.");

            channel.ChannelName = dto.ChannelName;
            channel.Type = dto.ChannelType;
            channel.ParentGuid = dto.ParentGuid;
            channel.Position = dto.Position;

            await _db.SaveChangesAsync();

            await _hubContext.Clients
                .Group($"server-{serverGuid}")
                .SendAsync("ServerChannelsUpdated", new { serverGuid, channelGuid, action = "updated" });

            return MapChannel(channel);
        }

        public async Task DeleteChannelAsync(Guid serverGuid, Guid channelGuid, ClaimsPrincipal user)
        {
            Guid userGuid = user.GetUserGuid();

            await _perm.RequirePermissionAsync(serverGuid, userGuid, AppPermissions.MANAGE_CHANNELS);

            var channel = await _helper.GetChannelOrThrowAsync(channelGuid);

            if (channel.ServerGuid != serverGuid)
                throw new UnauthorizedAccessException("Channel does not belong to this server.");

            // Delete messages inside channel
            var messages = _db.Messages.Where(m => m.ChannelGuid == channelGuid);
            _db.Messages.RemoveRange(messages);

            _db.Channels.Remove(channel);
            await _db.SaveChangesAsync();

            await _hubContext.Clients
                .Group($"server-{serverGuid}")
                .SendAsync("ServerChannelsUpdated", new { serverGuid, channelGuid, action = "deleted" });
        }

        
        private static ChannelResponseDto MapChannel(Channels c)
        {
            return new ChannelResponseDto
            {
                ChannelGuid = c.ChannelGuid,
                ServerGuid = c.ServerGuid,
                ChannelName = c.ChannelName,
                ChannelType = c.Type,
                ParentGuid = c.ParentGuid,
                Position = c.Position
            };
        }
    }
}
