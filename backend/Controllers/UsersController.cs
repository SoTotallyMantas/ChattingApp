using backend.Extensions;
using backend.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/users")]
    public class UsersController(IUserService users) : ControllerBase
    {
        private readonly IUserService _users = users;

        [HttpGet("search")]
        public async Task<IActionResult> Search([FromQuery] string? q, [FromQuery] int? limit)
        {
            var userGuid = User.GetUserGuid();
            var results = await _users.SearchUsersAsync(userGuid, q ?? string.Empty, limit ?? 20);
            return Ok(results);
        }
    }
}
