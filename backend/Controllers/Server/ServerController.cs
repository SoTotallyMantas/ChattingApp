using backend.DTO.ChannelDtos;
using backend.DTO.InviteDtos;
using backend.DTO.KickBanDtos;
using backend.DTO.RoleDtos;
using backend.DTO.ServerDtos;
using backend.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Net.Http.Headers;

namespace backend.Controllers.Server
{
    [Authorize]
    [ApiController]
    [Route("api/servers")]
    public class ServerController(IServerService serverService) : ControllerBase
    {
        private readonly IServerService _serverService = serverService;

        [HttpPost]
        public async Task<ActionResult<ServerResponseDto>> CreateServer([FromBody] CreateServerRequestDto dto)
        {
            if(dto.ServerName.Length <1)
            {
                return BadRequest("Server name empty");
            }
            return Ok(await _serverService.CreateServerAsync(dto, User));
        }

        [HttpGet("me")]
        public async Task<ActionResult<List<ServerResponseDto>>> GetMyServers()
        {
            return Ok(await _serverService.GetMyServersAsync(User));
        }
        [HttpGet("{serverGuid}")]
        public async Task<ActionResult<ServerResponseDto>> GetServerByGuid([FromRoute] Guid serverGuid)
        {
            return Ok(await _serverService.GetServerByGuidAsync(serverGuid, User));
        }

        [HttpDelete("{serverGuid}")]
        public async Task<ActionResult> DeleteServer([FromRoute] Guid serverGuid)
        {
            await _serverService.DeleteServerAsync(serverGuid, User);
            return NoContent();
        }
        [HttpPut("{serverGuid}")]
        public async Task<ActionResult<ServerResponseDto>> UpdateServer([FromRoute] Guid serverGuid, [FromBody] EditServerRequestDto dto)
        {
            var updatedServer = await _serverService.UpdateServerAsync(serverGuid, dto, User);
            return Ok(updatedServer);
        }
        
        [HttpPost("{serverGuid}/icon")]
        [RequestSizeLimit(7 * 1024 * 1024)]
        public async Task<ActionResult> UploadIcon([FromRoute] Guid serverGuid, IFormFile file, CancellationToken ct)
        {
            if (file == null || file.Length == 0) return BadRequest("Empty file");

            var key = await _serverService.UploadServerIconAsync(serverGuid, User, file.OpenReadStream(), file.ContentType ?? "application/octet-stream", ct);
            return Ok(new { iconKey = key });
        }

        [HttpPost("{serverGuid}/leave")]
        public async Task<ActionResult> LeaveServer([FromRoute] Guid serverGuid)
        {
            await _serverService.LeaveServerAsync(serverGuid, User);
            return NoContent();
        }

        [AllowAnonymous]
        [HttpGet("{serverGuid}/icon")]
        public async Task<ActionResult> GetServerIcon([FromRoute] Guid serverGuid, CancellationToken ct)
        {
            var result = await _serverService.GetServerIconAsync(serverGuid, ct);
            if (result == null) return NotFound();
            Response.Headers.CacheControl = "public,max-age=31536000,immutable";
            return File(result.Value.stream, result.Value.contentType ?? "application/octet-stream");
        }
    }
}
