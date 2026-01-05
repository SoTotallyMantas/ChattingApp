using backend.DTO.SettingsDtos;
using backend.Extensions;
using backend.Hubs;
using backend.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using System.Linq;

namespace backend.Controllers
{
    [ApiController]
    [Authorize]
    [Route("api/user-settings")]
    public class UserSettingsController(IUserService userService, IFriendService friendService, IHubContext<ChatHub> hubContext) : ControllerBase
    {
        private readonly IUserService _userService = userService;
        private readonly IFriendService _friendService = friendService;
        private readonly IHubContext<ChatHub> _hubContext = hubContext;
        
        [HttpGet]
        public async Task<ActionResult<UserSettingsResponseDto>> Get()
        {
            var userGuid = User.GetUserGuid();
            var settings = await _userService.GetUserSettingsAsync(userGuid);
            if (settings == null) return NotFound();
            return Ok(settings);
        }

        [HttpPut]
        public async Task<ActionResult<UserSettingsResponseDto>> Update([FromBody] UpdateUserSettingsRequestDto dto)
        {
            var userGuid = User.GetUserGuid();
            var updated = await _userService.UpdateUserSettingsAsync(userGuid, dto);
            await NotifyProfileUpdatedAsync(userGuid);
            return Ok(updated);
        }

        [HttpPost("avatar")]
        [RequestSizeLimit(7 * 1024 * 1024)]
        public async Task<ActionResult> UploadAvatar(IFormFile file, CancellationToken ct)
        {
            if(file == null || file.Length == 0)
            {
                return BadRequest("Empty file");
            }

            var userGuid = User.GetUserGuid();

            var key = await _userService.UploadAvatarAsync(userGuid,file.OpenReadStream(),file.ContentType,ct);
            await NotifyProfileUpdatedAsync(userGuid);

            return Ok(new { avatarKey = key });
        }

        [AllowAnonymous]
        [HttpGet("avatar")]
        public async Task<ActionResult> GetUserAvatar(Guid userGuid, CancellationToken ct)
        {


            var result = await _userService.GetAvatarAsync(userGuid, ct);
            if (result == null)
            {
                return NotFound();
            }
            var stream = result.Value.stream;
            var contentType = result.Value.contentType;
            Response.Headers.CacheControl = "public,max-age=86400";
            return File(stream, contentType);
        }

        private async Task NotifyProfileUpdatedAsync(Guid userGuid)
        {
            var profile = await _userService.GetBasicProfileAsync(userGuid);
            var payload = new
            {
                userGuid,
                displayName = profile?.DisplayName,
                avatarKey = profile?.AvatarKey
            };

            var serverGuids = await _userService.GetServersForUserAsync(userGuid);
            var groupTasks = serverGuids.Select(id =>
                _hubContext.Clients.Group($"server-{id}").SendAsync("UserProfileUpdated", payload)
            );
            var friendGuids = await _friendService.GetFriendGuidsAsync(userGuid);
            var friendTasks = friendGuids.Select(id =>
                _hubContext.Clients.User(id.ToString()).SendAsync("UserProfileUpdated", payload)
            );
            var selfTask = _hubContext.Clients.User(userGuid.ToString()).SendAsync("UserProfileUpdated", payload);

            await Task.WhenAll(groupTasks.Concat(friendTasks).Append(selfTask));
        }
    }
}
