using backend.DTO.RoleDtos;
using backend.DTO.ServerDtos;
using backend.Interfaces;
using backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers.Server
{
    [Authorize]
    [ApiController]
    [Route("api/servers/{serverGuid}/roles")]
    public class ServerRoleController(IServerRolesService serverRolesService) : ControllerBase
    {
        private readonly IServerRolesService _serverRolesService = serverRolesService;


        [HttpGet]
        public async Task<ActionResult<List<ServerRoleResponseDto>>> GetServerRoles([FromRoute] Guid serverGuid)
        {
            var roles = await _serverRolesService.GetServerRolesAsync(serverGuid, User);
            return Ok(roles);
        }
        [HttpDelete("{roleGuid}")]
        public async Task<ActionResult> DeleteServerRole([FromRoute] Guid serverGuid, [FromRoute] Guid roleGuid)
        {
            await _serverRolesService.DeleteServerRoleAsync(serverGuid, roleGuid, User);
            return NoContent();
        }
        [HttpPost("{roleGuid}/remove")]
        public async Task<ActionResult> RemoveRoleFromUser([FromRoute] Guid serverGuid, [FromRoute] Guid roleGuid, [FromBody] RemoveRoleRequestDto dto)
        {
            await _serverRolesService.RemoveRoleFromUserAsync(serverGuid, roleGuid, dto, User);
            return NoContent();
        }
        [HttpGet("{roleGuid}/members")]
        public async Task<ActionResult<List<ServerMemberResponseDto>>> GetMembersWithRole([FromRoute] Guid serverGuid, [FromRoute] Guid roleGuid)
        {
            var members = await _serverRolesService.GetMembersWithRoleAsync(serverGuid, roleGuid, User);
            return Ok(members);
        }

        [HttpPost]
        public async Task<ActionResult> CreateRole([FromRoute] Guid serverGuid, [FromBody] CreateRoleRequestDto dto)
        {
            return Ok(await _serverRolesService.CreateRoleAsync(serverGuid, dto, User));
        }
        [HttpPost("{roleGuid}/assign")]
        public async Task<ActionResult> AssignRoleToUser([FromRoute] Guid serverGuid, [FromRoute] Guid roleGuid, [FromBody] AssignRoleRequestDto dto)
        {
            await _serverRolesService.AssignRoleToUserAsync(serverGuid, roleGuid, dto, User);
            return NoContent();
        }

        [HttpPost("{roleGuid}/permissions")]
        public async Task<ActionResult> UpdateRolePermissions([FromRoute] Guid serverGuid, [FromRoute] Guid roleGuid, [FromBody] UpdateRolePermissionsRequestDto dto)
        {
            await _serverRolesService.UpdateRolePermissionsAsync(serverGuid, roleGuid, dto, User);
            return NoContent();
        }
        [HttpPut("{roleGuid}")]
        public async Task<IActionResult> EditRole(Guid serverGuid, Guid roleGuid, EditRoleRequestDto dto)
        {
            if (roleGuid != dto.RoleGuid)
                return BadRequest("Role ID mismatch.");

            await _serverRolesService.UpdateRoleAsync(serverGuid, dto, User);
            return NoContent();
        }
        [HttpPost("reorder")]
        public async Task<IActionResult> ReorderRoles(Guid serverGuid, [FromBody] ReorderRolesRequestDto dto)
        {
            await _serverRolesService.ReorderRolesAsync(serverGuid, dto, User);
            return NoContent();
        }
    }
}
