using backend.DTO.MessageDtos;

namespace backend.Interfaces
{
    public interface IMessageService
    {
        Task<MessageResponseDto> SendMessageAsync(SendMessageRequestDto requestDto, Guid userGuid);
        Task<MessageResponseDto> EditMessageAsync(EditMessageRequestDto requestDto, Guid userGuid);
        Task<List<MessageResponseDto>> GetHistoryAsync(Guid channelGuid, DateTime? before, Guid userGuid);

        Task<bool> DeleteMessageAsync(Guid messageGuid, Guid userGuid);

        Task AddAttachmentAsync(Guid messageGuid, Stream fileStream, string fileName, string contentType, long sizeBytes, Guid userguid, CancellationToken ct = default);
        Task<List<MessageResponseDto>> SearchAsync(Guid channelGuid, string query, Guid userGuid, int limit = 20, double minScore = 0.35);
        Task<(Stream Stream, string ContentType, string FileName)> GetAttachmentAsync(Guid attachmentGuid, Guid userGuid, CancellationToken ct = default);
    }
}
