using backend.DTO.ChannelDtos;
using backend.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers.Server
{
    [Authorize]
    [ApiController]
    [Route("api/servers/{serverGuid}/channels")]
    public class ServerChannelController(IChannelService channelService) : ControllerBase
    {
        private readonly IChannelService _channelService = channelService;


        [HttpGet]
        public async Task<ActionResult<List<ChannelResponseDto>>> GetChannels([FromRoute] Guid serverGuid)
        {
            var channels = await _channelService.GetChannelsAsync(serverGuid, User);
            return Ok(channels);
        }
        [HttpPost]
        public async Task<ActionResult<ChannelResponseDto>> CreateChannel([FromRoute] Guid serverGuid, [FromBody] CreateChannelRequestDto dto)
        {
            var channel = await _channelService.CreateChannelAsync(serverGuid, dto, User);
            return Ok(channel);
        }
        [HttpDelete("{channelGuid}")]
        public async Task<ActionResult> DeleteChannel([FromRoute] Guid serverGuid, [FromRoute] Guid channelGuid)
        {
            await _channelService.DeleteChannelAsync(serverGuid, channelGuid, User);
            return NoContent();
        }
        [HttpPut("{channelGuid}")]
        public async Task<ActionResult<ChannelResponseDto>> UpdateChannel([FromRoute] Guid serverGuid, [FromRoute] Guid channelGuid, [FromBody] EditChannelRequestDto dto)
        {
            var updatedChannel = await _channelService.UpdateChannelAsync(serverGuid, channelGuid, dto, User);
            return Ok(updatedChannel);
        }

        [HttpGet("{channelGuid}")]
        public async Task<ActionResult<ChannelResponseDto>> GetChannelByGuid([FromRoute] Guid channelGuid)
        {
            var channel = await _channelService.GetChannelByGuidAsync(channelGuid, User);
            return Ok(channel);
        }
    }
}
