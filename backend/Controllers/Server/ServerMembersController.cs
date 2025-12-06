using backend.DTO.KickBanDtos;
using backend.DTO.ServerDtos;
using backend.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers.Server
{
    [Authorize]
    [ApiController]
    [Route("api/servers/{serverGuid}/members")] 
    public class ServerMembersController(IServerMemberService serverMembersService): ControllerBase
    {
       private readonly IServerMemberService _serverMembersService = serverMembersService;

        [HttpGet]
        public async Task<ActionResult<List<ServerMemberResponseDto>>> GetServerMembers([FromRoute] Guid serverGuid)
        {
            var members = await _serverMembersService.GetServerMembersAsync(serverGuid, User);
            return Ok(members);
        }

        [HttpPost("kick")]
        public async Task<ActionResult> KickUserFromServer([FromRoute] Guid serverGuid, [FromBody] KickMemberRequestDto dto)
        {
            await _serverMembersService.KickUserFromServerAsync(serverGuid, dto, User);
            return NoContent();
        }
        [HttpPost("ban")]
        public async Task<ActionResult> BanUserFromServer([FromRoute] Guid serverGuid, [FromBody] BanMemberRequestDto dto)
        {
            await _serverMembersService.BanUserFromServerAsync(serverGuid, dto, User);
            return NoContent();
        }
        [HttpPost("unban")]
        public async Task<ActionResult> UnbanUserFromServer([FromRoute] Guid serverGuid, [FromBody] UnbanMemberRequestDto dto)
        {
            await _serverMembersService.UnbanUserFromServerAsync(serverGuid, dto, User);
            return NoContent();
        }
        [HttpGet("bans")]
        public async Task<ActionResult<List<BanResponseDto>>> GetServerBans([FromRoute] Guid serverGuid)
        {
            var bans = await _serverMembersService.GetServerBansAsync(serverGuid, User);
            return Ok(bans);
        }
    }
}
