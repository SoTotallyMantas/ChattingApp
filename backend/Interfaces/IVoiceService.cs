using backend.Models;

namespace backend.Interfaces
{
    public interface IVoiceService
    {
        Task<int> GetOrCreateJanusRoomIdAsync(Guid channelGuid);
        Task JoinVoiceAsync(Guid channelGuid, Guid userGuid);
        Task LeaveVoiceAsync(Guid channelGuid, Guid userGuid);
        Task UpdateMuteStateAsync(Guid channelGuid, Guid userGuid, bool isMuted);
        Task UpdateDeafenStateAsync(Guid channelGuid, Guid userGuid, bool isDeafened);
        Task<List<VoiceStates>> GetVoiceStatesAsync(Guid channelGuid);
        Task<Guid?> GetUserChannelAsync(Guid userGuid);
    }
}
