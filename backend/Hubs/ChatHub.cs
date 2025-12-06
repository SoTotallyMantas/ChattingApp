using backend.Extensions;
using backend.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;

namespace backend.Hubs
{
    [Authorize]
    public class ChatHub : Hub
    {
        private readonly IUserService _userService;  

        public ChatHub(IUserService userService)
        {
             _userService = userService;
        }
        private Guid GetUserGuid() => Context.User!.GetUserGuid();
        public override async Task OnConnectedAsync()
        {
            Guid userGuid = GetUserGuid();

            List<Guid> ServersGuidList = await _userService.GetServersForUserAsync(userGuid);

            foreach (var serverGuid in ServersGuidList)
            {
                await Groups.AddToGroupAsync(Context.ConnectionId, $"server-{serverGuid}");
            }

            await base.OnConnectedAsync();
        }
        public async Task JoinServer(Guid serverGuid)
        {
            Guid userGuid = GetUserGuid();

            if (!await _userService.isServerMemberAsync(userGuid, serverGuid))
                throw new HubException("Not allowed");

            await Groups.AddToGroupAsync(Context.ConnectionId, $"server-{serverGuid}");
        }

        public async Task LeaveServer(Guid serverGuid)
        {
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, $"server-{serverGuid}");
        }
        public override async Task OnDisconnectedAsync(Exception? exception)
        {
            Guid userGuid = GetUserGuid();
            List<Guid> ServersGuidList = await _userService.GetServersForUserAsync(userGuid);
            foreach (var serverGuid in ServersGuidList)
            {
                await Groups.RemoveFromGroupAsync(Context.ConnectionId, $"server-{serverGuid}");
            }
            await base.OnDisconnectedAsync(exception);
        }

        public async Task JoinChannel (Guid channelId)
        {
            Guid userGuid = GetUserGuid();
            if (!await _userService.IsChannelMember(userGuid, channelId))
            {
                throw new HubException("You are not a member of this channel.");
            }

            await Groups.AddToGroupAsync(Context.ConnectionId, $"channel-{channelId}");
        }
        public async Task LeaveChannel (Guid channelId)
        {
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, $"channel-{channelId}");
        }
    }
}
