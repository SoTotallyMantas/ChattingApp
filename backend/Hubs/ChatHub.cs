using System.Collections.Concurrent;
using backend.Extensions;
using backend.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore.Infrastructure.Internal;

namespace backend.Hubs
{
    [Authorize]
    public class ChatHub : Hub
    {
        private readonly IUserService _userService;  
        private readonly IFriendService _friendService;
        private static readonly ConcurrentDictionary<Guid, int> ConnectionCounts = new();
        public ChatHub(IUserService userService, IFriendService friendService)
        {
             _userService = userService;
             _friendService = friendService;
        }
        private Guid GetUserGuid() => Context.User!.GetUserGuid();
        public override async Task OnConnectedAsync()
        {
            Guid userGuid = GetUserGuid();
            if(userGuid == Guid.Empty)
            {
                await base.OnConnectedAsync();
                return;
            }
            List<Guid> ServersGuidList = await _userService.GetServersForUserAsync(userGuid);

            foreach (var serverGuid in ServersGuidList)
            {
                await Groups.AddToGroupAsync(Context.ConnectionId, $"server-{serverGuid}");
            }
            int count = ConnectionCounts.AddOrUpdate(userGuid, 1,(_, current) => current + 1);
            if (count > 0)
            {
                await _userService.SetUserPresenceStatusAsync(userGuid, "online");
                await NotifyPresenceAsync(userGuid, "online", ServersGuidList);
            }

            await base.OnConnectedAsync();
        }
        private async Task NotifyPresenceAsync(Guid userGuid, string status, List<Guid> serverGuids)
        {
            var payload = new { 
                userGuid,
                status
            };

            var groupTasks = serverGuids.Select(id => 
                Clients.Group($"server-{id}").SendAsync("UserPresenceChanged", payload)
            );
            var friendGuids = await _friendService.GetFriendGuidsAsync(userGuid);
            var friendTasks = friendGuids.Select(id =>
                Clients.User(id.ToString()).SendAsync("UserPresenceChanged", payload));

            await Task.WhenAll(groupTasks.Concat(friendTasks));
        }


        public async Task JoinServer(Guid serverGuid)
        {
            Guid userGuid = GetUserGuid();

            if (!await _userService.IsServerMemberAsync(userGuid, serverGuid))
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
            if(userGuid == Guid.Empty)
            {
                await base.OnDisconnectedAsync(exception);
                return;
            }
            List<Guid> ServersGuidList = await _userService.GetServersForUserAsync(userGuid);
            foreach (var serverGuid in ServersGuidList)
            {
                await Groups.RemoveFromGroupAsync(Context.ConnectionId, $"server-{serverGuid}");
            }
            if (ConnectionCounts.TryGetValue(userGuid, out int count))
            {
                if (count <= 1)
                {
                    ConnectionCounts.TryRemove(userGuid, out _);
                    await _userService.SetUserPresenceStatusAsync(userGuid, "offline");
                    await NotifyPresenceAsync(userGuid, "offline", ServersGuidList);
                }
                else
                {
                    ConnectionCounts[userGuid] = count - 1;
                }
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
