using backend.DTO.InviteDtos;
using backend.Interfaces;
using backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers.Server
{
    [Authorize]
    [ApiController]
    [Route("api/servers/{serverGuid}/invites")]
    public class ServerInviteController(IInviteService inviteService) : ControllerBase
    {
        private readonly IInviteService _inviteService = inviteService;

        [HttpPost]
        public async Task<ActionResult<InviteResponseDto>> CreateInvite([FromRoute] Guid serverGuid, [FromBody] CreateInviteRequestDto dto)
        {
            var invite = await _inviteService.CreateInviteAsync(serverGuid, dto, User);
            return Ok(invite);
        }

        [HttpPost("{inviteGuid}/join")]
        public async Task<ActionResult> JoinServerViaInvite([FromRoute] Guid inviteGuid)
        {
            await _inviteService.JoinServerViaInviteAsync(inviteGuid, User);
            return Ok();
        }

        [HttpGet]
        public async Task<ActionResult<List<InviteResponseDto>>> GetInvites([FromRoute] Guid serverGuid)
        {
            var invites = await _inviteService.GetInvitesAsync(serverGuid, User);
            return Ok(invites);
        }
        [HttpDelete("{inviteGuid}")]
        public async Task<ActionResult> RevokeInvite([FromRoute] Guid inviteGuid)
        {
            await _inviteService.RevokeInviteAsync(inviteGuid, User);
            return Ok();
        }
    }
}
