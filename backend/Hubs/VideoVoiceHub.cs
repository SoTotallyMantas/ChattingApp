using backend.Extensions;
using backend.Interfaces;
using backend.Models;
using backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using System.Collections.Concurrent;

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
            int roomId = await _voice.GetOrCreateJanusRoomIdAsync(channelGuid);

            var session = new UserMediaSession
            {
                RoomId = roomId,
                UserGuid = user
            };

            MediaSessions[user] = session;

       
            await Clients.User(user.ToString()).SendAsync("UserJoinedChannel", new { userGuid = user, channelGuid, roomId });

            return new { roomId };
        }

      
        public async Task MuteUser(Guid channelGuid, bool isMuted)
        {
            var user = GetUser();
            if (!MediaSessions.ContainsKey(user))
                throw new Exception("User is not in a channel");

            await _voice.UpdateMuteStateAsync(channelGuid, user, isMuted);

            await Clients.User(user.ToString()).SendAsync("UserMutedState", new { userGuid = user, isMuted });
        }

        public async Task DeafenUser(Guid channelGuid, bool isDeafened)
        {
            var user = GetUser();
            if (!MediaSessions.ContainsKey(user))
                throw new Exception("User is not in a channel");

            await _voice.UpdateDeafenStateAsync(channelGuid, user, isDeafened);

            await Clients.User(user.ToString()).SendAsync("UserDeafenedState", new { userGuid = user, isDeafened });
        }

     
        public async Task LeaveChannel(Guid channelGuid)
        {
            var user = GetUser();
            if (MediaSessions.TryRemove(user, out var session))
            {
                await _voice.LeaveVoiceAsync(channelGuid, user);

               
                await Clients.Group(channelGuid.ToString()).SendAsync("UserLeftChannel", new { userGuid = user });
            }
        }

        public override async Task OnDisconnectedAsync(Exception? ex)
        {
            var user = GetUser();
            if (MediaSessions.ContainsKey(user))
            {
                await LeaveChannel(Guid.NewGuid()); 
            }
            await base.OnDisconnectedAsync(ex);
        }
    }

    public class UserMediaSession
    {
        public Guid UserGuid { get; set; }
        public int RoomId { get; set; }
    }
}
