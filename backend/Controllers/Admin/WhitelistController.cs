using backend.Context;
using backend.DTO.AdminDtos;
using backend.Extensions;
using backend.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Linq;

namespace backend.Controllers.Admin
{
    [ApiController]
    [Route("api/admin/whitelist")]
    [Authorize(Policy = "SysAdmin")]
    public class WhitelistController : ControllerBase
    {
        private readonly VoxlockDbContext _db;

        public WhitelistController(VoxlockDbContext db)
        {
            _db = db;
        }

        private static WhitelistEntryResponseDto Map(RegistrationWhitelist entry) =>
            new()
            {
                WhitelistGuid = entry.WhitelistGuid,
                Email = entry.Email,
                AddedAt = entry.AddedAt,
                AddedBy = entry.AddedBy
            };

        [HttpGet]
        public async Task<ActionResult<List<WhitelistEntryResponseDto>>> GetAll()
        {
            var entries = await _db.RegistrationWhitelist
                .AsNoTracking()
                .OrderBy(e => e.Email)
                .ToListAsync();

            return Ok(entries.Select(Map).ToList());
        }

        [HttpPost]
        public async Task<ActionResult<WhitelistEntryResponseDto>> Create([FromBody] CreateWhitelistEntryRequestDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.Email))
            {
                return BadRequest("Email is required.");
            }

            var normalizedEmail = dto.Email.Trim().ToLowerInvariant();

            bool exists = await _db.RegistrationWhitelist.AnyAsync(w => w.Email == normalizedEmail);
            if (exists)
            {
                return Conflict("Email already whitelisted.");
            }

            var userGuid = User.GetUserGuid();

            var entry = new RegistrationWhitelist
            {
                WhitelistGuid = Guid.NewGuid(),
                Email = normalizedEmail,
                AddedAt = DateTime.UtcNow,
                AddedBy = userGuid
            };

            _db.RegistrationWhitelist.Add(entry);
            await _db.SaveChangesAsync();

            return Ok(Map(entry));
        }

        [HttpDelete("{guid}")]
        public async Task<IActionResult> Delete(Guid guid)
        {
            var entry = await _db.RegistrationWhitelist.FirstOrDefaultAsync(w => w.WhitelistGuid == guid);

            if (entry == null)
            {
                return NotFound();
            }

            _db.RegistrationWhitelist.Remove(entry);
            await _db.SaveChangesAsync();

            return NoContent();
        }
    }
}
