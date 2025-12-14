using backend.DTO.SettingsDtos;
using backend.Extensions;
using backend.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers
{
    [ApiController]
    [Authorize]
    [Route("api/user-settings")]
    public class UserSettingsController(IUserService userService) : ControllerBase
    {
        private readonly IUserService _userService = userService;
        
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
    }
}
