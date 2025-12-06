using backend.DTO.MessageDtos;
using backend.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/messages")]
    public class MessageController(IMessageService messages, IUserContext userContext) : ControllerBase
    {
        private readonly IMessageService _messages = messages;
        private readonly IUserContext _userContext = userContext;

        [HttpGet("history")]
        [Authorize]
        public async Task<ActionResult<List<MessageResponseDto>>> GetHistory(
        [FromQuery] Guid channelGuid,
        [FromQuery] DateTime? before)
        {
            Guid userGuid = _userContext.UserGuid;

            var messages = await _messages.GetHistoryAsync(channelGuid, before, userGuid);
            return Ok(messages);
        }
        [HttpPost]
        [Authorize]
        public async Task<ActionResult<MessageResponseDto>> SendMessage([FromBody] SendMessageRequestDto dto)
        {
            Guid userGuid = _userContext.UserGuid;
            var result = await _messages.SendMessageAsync(dto, userGuid);
            return Ok(result);
        }
        [HttpPut]
        [Authorize]
        public async Task<ActionResult<MessageResponseDto>> EditMessage([FromBody] EditMessageRequestDto dto)
        {
            Guid userGuid = _userContext.UserGuid;
            var result = await _messages.EditMessageAsync(dto, userGuid);
            return Ok(result);
        }

        [HttpDelete]
        [Authorize]
        public async Task<ActionResult> DeleteMessage([FromQuery] Guid messageGuid)
        {
            Guid userGuid = _userContext.UserGuid;
            await _messages.DeleteMessageAsync(messageGuid, userGuid);
            return NoContent();
        }
    }
}
