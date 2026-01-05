using backend.Extensions;
using backend.Interfaces;
using backend.Models;
using backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using System.Collections.Concurrent;
using System.Linq;

namespace backend.Hubs
{
    [Authorize]
    public class VideoVoiceHub : Hub
    {
        private readonly IVoiceService _voice;
        private readonly IUserService _users;

        private static readonly ConcurrentDictionary<Guid, UserMediaSession> MediaSessions = new();

        public VideoVoiceHub(IVoiceService voice, IUserService users)
        {
            _voice = voice;
            _users = users;
        }

        private Guid GetUser() => Context.User!.GetUserGuid();

        
        public async Task<object> JoinChannel(Guid channelGuid)
        {
            var user = GetUser();
            if (MediaSessions.TryGetValue(user, out var existing))
            {
                if(existing.ConnectionId != Context.ConnectionId)
                {
                    await Clients.Client(existing.ConnectionId)
                        .SendAsync("VoiceDisconnected", new {channelGuid = existing.ChannelGuid});
                    await Groups.RemoveFromGroupAsync(existing.ConnectionId, existing.ChannelGuid.ToString());
                    await _voice.LeaveVoiceAsync(existing.ChannelGuid, user);
                    await Clients.Group(existing.ChannelGuid.ToString())
                        .SendAsync("UserLeftChannel", new { userGuid = user, channelGuid = existing.ChannelGuid });
                    MediaSessions.TryRemove(user, out _);
                }
                else if (existing.ChannelGuid != channelGuid)
                {
                    await LeaveChannel();
 
                }
            }
            int roomId = await _voice.GetOrCreateJanusRoomIdAsync(channelGuid);

            var session = new UserMediaSession
            {
                RoomId = roomId,
                UserGuid = user,
                ChannelGuid = channelGuid,
                ConnectionId = Context.ConnectionId
            };

            MediaSessions[user] = session;

            await _voice.JoinVoiceAsync(channelGuid, user);
            await Groups.AddToGroupAsync(Context.ConnectionId, channelGuid.ToString());

            var state = (await _voice.GetVoiceStatesAsync(channelGuid))
                .FirstOrDefault(v => v.UserGuid == user);
            var isMuted = state?.IsMuted ?? false;
            var isDeafened = state?.IsDeafened ?? false;

            var profile = await _users.GetBasicProfileAsync(user);
            await Clients.Group(channelGuid.ToString()).SendAsync("UserJoinedChannel", new
            {
                userGuid = user,
                channelGuid,
                roomId,
                displayName = profile?.DisplayName,
                avatarKey = profile?.AvatarKey,
                isMuted,
                isDeafened
            });

            return new { roomId };
        }

      
        public async Task MuteUser(Guid channelGuid, bool isMuted)
        {
            var user = GetUser();
            if (!MediaSessions.TryGetValue(user, out var session) || session.ConnectionId != Context.ConnectionId)
            {
                throw new Exception("User is not in a channel");
            }  
            if(session.ChannelGuid != channelGuid)
            {
                throw new Exception("User is not in the specified channel");
            }
            await _voice.UpdateMuteStateAsync(session.ChannelGuid, user, isMuted);
            await Clients.Group(session.ChannelGuid.ToString())
            .SendAsync("UserMutedState", new { userGuid = user, isMuted, channelGuid = session.ChannelGuid });
        }
        public async Task WatchChannel(Guid channelGuid)
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, channelGuid.ToString());

        }
        public async Task UnwatchChannel(Guid channelGuid)
        {
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, channelGuid.ToString());

        }
        public async Task DeafenUser(Guid channelGuid, bool isDeafened)
        {
            var user = GetUser();
            if (!MediaSessions.TryGetValue(user, out var session) || session.ConnectionId != Context.ConnectionId)
            {
                throw new Exception("User is not in a channel");
            }
            if(session.ChannelGuid != channelGuid)
            {
                throw new Exception("User is not in the specified channel");
            }
            await _voice.UpdateDeafenStateAsync(session.ChannelGuid, user, isDeafened);
            await Clients.Group(session.ChannelGuid.ToString())
                .SendAsync("UserDeafenedState", new { userGuid = user, isDeafened, channelGuid = session.ChannelGuid });
        }

     
        public async Task LeaveChannel()
        {
            var user = GetUser();
            if (!MediaSessions.TryGetValue(user, out var session) || session.ConnectionId != Context.ConnectionId)
            {
                return;
            }
            MediaSessions.TryRemove(user, out _);
            var prevChannelGuid = session.ChannelGuid;
            await _voice.LeaveVoiceAsync(prevChannelGuid, user);
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, prevChannelGuid.ToString());
            await Clients.Group(prevChannelGuid.ToString())
                .SendAsync("UserLeftChannel", new { userGuid = user, channelGuid = prevChannelGuid});
            
        }

        public override async Task OnDisconnectedAsync(Exception? ex)
        {
            var user = GetUser();
            if (MediaSessions.TryGetValue(user, out var session ) && session.ConnectionId == Context.ConnectionId)
            {
                await LeaveChannel();
            }
            await base.OnDisconnectedAsync(ex);
        }
    }
   
    public class UserMediaSession
    {
        public Guid UserGuid { get; set; }
        public int RoomId { get; set; }
        public Guid ChannelGuid { get; set; }
        public string ConnectionId { get; set; } = string.Empty;
    }
}
