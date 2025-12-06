using backend.DTO.MessageDtos;

namespace backend.Interfaces
{
    public interface IMessageService
    {
        Task<MessageResponseDto> SendMessageAsync(SendMessageRequestDto requestDto, Guid userGuid);
        Task<MessageResponseDto> EditMessageAsync(EditMessageRequestDto requestDto, Guid userGuid);
        Task<List<MessageResponseDto>> GetHistoryAsync(Guid channelGuid, DateTime? before, Guid userGuid);

        Task<bool> DeleteMessageAsync(Guid messageGuid, Guid userGuid);
    }
}
