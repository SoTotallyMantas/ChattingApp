using backend.Interfaces;
using backend.DTO.VoiceStateDtos;
using backend.Extensions;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/voice/channels")]
    public class VoiceController : ControllerBase
    {
        private readonly IVoiceService _voice;
        private readonly IUserService _users;

        public VoiceController(IVoiceService voice, IUserService users)
        {
            _voice = voice;
            _users = users;
        }
        [HttpGet("me/channel")]
        public async Task<Guid?> GetMyChannel()
        {
            return await _voice.GetUserChannelAsync(User.GetUserGuid());
        }

        [HttpGet("{channelGuid}/users")]
        public async Task<List<VoiceUserDto>> GetUsers(Guid channelGuid)
        {
            var states = await _voice.GetVoiceStatesAsync(channelGuid);
            var currentUser = User.GetUserGuid();

            var result = new List<VoiceUserDto>();

            foreach (var v in states)
            {
                var profile = await _users.GetBasicProfileAsync(v.UserGuid);

                result.Add(new VoiceUserDto
                {
                    UserGuid = v.UserGuid,
                    ChannelGuid = v.ChannelGuid,
                    IsMuted = v.IsMuted,
                    IsDeafened = v.IsDeafened,
                    DisplayName = profile?.DisplayName,
                    AvatarKey = profile?.AvatarKey
                });
            }


            return result;
        }
    }
}
