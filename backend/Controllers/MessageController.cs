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

        [HttpGet("search")]
        [Authorize]
        public async Task<ActionResult<List<MessageResponseDto>>> Search(
            [FromQuery] Guid channelGuid,
            [FromQuery] string query,
            [FromQuery] int limit = 20)
        {
            Guid userGuid = _userContext.UserGuid;
            const double minScore = 0.35;
            var results = await _messages.SearchAsync(channelGuid, query, userGuid, limit, minScore);
            return Ok(results);
        }

        [HttpDelete]
        [Authorize]
        public async Task<ActionResult> DeleteMessage([FromQuery] Guid messageGuid)
        {
            Guid userGuid = _userContext.UserGuid;
            await _messages.DeleteMessageAsync(messageGuid, userGuid);
            return NoContent();
        }

        [HttpPost("{messageGuid}/attachemnts")]
        [Authorize]
        [RequestSizeLimit(10 * 1024 * 1024)]
        public async Task<ActionResult> UploadAttachment([FromQuery] Guid messageGuid ,IFormFile file, CancellationToken ct)
        {
            if (file == null || file.Length == 0)
            {
                return BadRequest();
            }

            await _messages.AddAttachmentAsync(
                 messageGuid,
                 file.OpenReadStream(),
                 file.FileName,
                 file.ContentType,
                 file.Length,
                 _userContext.UserGuid,
                 ct
                );

            return Ok();
            
        }

        [HttpGet("attachment")]
        [Authorize]
        public async Task<ActionResult> DownloadAttachment([FromQuery] Guid attachmentGuid, CancellationToken ct)
        {
            var userGuid = _userContext.UserGuid;
            var result = await _messages.GetAttachmentAsync(attachmentGuid, userGuid, ct);
            return File(result.Stream, result.ContentType, result.FileName);
        }
    }
}
