using backend.DTO.ServerDtos;
using backend.Extensions;
using backend.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers.Server
{
    [Authorize]
    [ApiController]
    [Route("api/servers/{serverGuild}/audit")]
    public class ServerAuditController(IAuditService auditService) : ControllerBase
    {
        private readonly IAuditService _auditService = auditService;

        [HttpGet()]
        public async Task<ActionResult<List<ServerAuditLogEntryResponseDto>>> GetServerAuditLogs([FromRoute] Guid serverGuid)
        {
            var logs = await _auditService.GetServerAuditLogsAsync(serverGuid, User);
            return Ok(logs);
        }

        [HttpPost]
        public async Task<ActionResult> AddAuditLog([FromRoute] Guid serverGuid, [FromBody] string action)
        {
            Guid performedByGuid = User.GetUserGuid();
            await _auditService.AddAuditLogAsync(serverGuid, performedByGuid, action);
            return NoContent();
        }
    }
}
