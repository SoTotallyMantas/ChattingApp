using backend.Context;
using backend.DTO.PermissionsResponseDtos;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/permissions")]
    public class PermissionController : ControllerBase
    {
        private readonly VoxlockDbContext _db;

        public PermissionController(VoxlockDbContext db)
        {
            _db = db;
        }

        [HttpGet]
        public async Task<ActionResult<List<PermissionResponseDto>>> GetPermissions()
        {
            var perms = await _db.Permissions
                .OrderBy(p => p.Category)
                .ThenBy(p => p.Name)
                .Select(p => new PermissionResponseDto
                {
                    PermissionGuid = p.PermissionGuid,
                    PermissionName = p.Name,
                    Description = p.Description ?? "",
                    Category = p.Category
                })
                .ToListAsync();

            return Ok(perms);
        }
    }
}
