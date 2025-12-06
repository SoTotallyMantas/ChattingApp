using backend.DTO.ChannelDtos;
using System.Security.Claims;

namespace backend.Interfaces
{
    public interface IChannelService
    {
        Task<ChannelResponseDto> CreateChannelAsync(Guid serverGuid, CreateChannelRequestDto dto, ClaimsPrincipal user);
        Task DeleteChannelAsync(Guid serverGuid, Guid channelGuid, ClaimsPrincipal user);
        Task<List<ChannelResponseDto>> GetChannelsAsync(Guid serverGuid, ClaimsPrincipal user);
        Task<ChannelResponseDto> UpdateChannelAsync(Guid serverGuid, Guid channelGuid, EditChannelRequestDto dto, ClaimsPrincipal user);
        Task<ChannelResponseDto> GetChannelByGuidAsync(Guid channelGuid, ClaimsPrincipal user);


    }
}
