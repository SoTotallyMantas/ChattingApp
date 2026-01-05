using backend.Context;
using backend.Extensions;
using backend.Helper;
using backend.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Controllers.Server
{
    [Authorize]
    [ApiController]
    [Route("api/servers/{serverGuid}/permissions")]
    public class ServerPermissionsController : ControllerBase
    {
        private readonly VoxlockDbContext _db;
        private readonly IPermissionService _permissionService;

        public ServerPermissionsController(VoxlockDbContext db, IPermissionService permissionService)
        {
            _db = db;
            _permissionService = permissionService;
        }

        [HttpGet("me")]
        public async Task<ActionResult<List<string>>> GetMyPermissions([FromRoute] Guid serverGuid)
        {
            var userGuid = User.GetUserGuid();

            var server = await _db.Servers
                .AsNoTracking()
                .FirstOrDefaultAsync(s => s.ServerGuid == serverGuid);

            if (server == null)
            {
                return NotFound();
            }

            await _permissionService.RequireMembership(serverGuid, userGuid);

            if (server.OwnerGuid == userGuid)
            {
                return Ok(AppPermissions.All);
            }

            var permissions = await _db.ServerUserRoles
                .Where(r => r.ServerGuid == serverGuid && r.UserGuid == userGuid)
                .SelectMany(r => r.Role.RolePermissions)
                .Select(rp => rp.Permission.Name)
                .Distinct()
                .OrderBy(name => name)
                .ToListAsync();

            return Ok(permissions);
        }
    }
}
