using backend.DTO.DmDtos;
using backend.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/dms")]
    public class DmController(IDmService dms, IUserContext userContext) : ControllerBase
    {
        private readonly IDmService _dms = dms;
        private readonly IUserContext _userContext = userContext;

        [HttpPost("{friendGuid}")]
        public async Task<ActionResult<DmThreadResponseDto>> StartDm([FromRoute] Guid friendGuid)
        {
            var result = await _dms.GetOrCreateDmAsync(_userContext.UserGuid, friendGuid);
            return Ok(result);
        }
    }
}
