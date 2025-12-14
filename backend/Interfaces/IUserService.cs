using backend.DTO.SettingsDtos;
using backend.DTO.UserDtos;

namespace backend.Interfaces
{
    public interface IUserService
    {
        Task<List<Guid>> GetServersForUserAsync(Guid userGuid);
        Task<bool> isServerMemberAsync(Guid userGuid, Guid serverGuid);
        Task<bool> IsChannelMember(Guid userGuid, Guid channelGuid);
        Task<bool> HasChannelPermission(Guid userGuid, Guid channelGuid, string permission);
        Task<UserProfileDto?> GetBasicProfileAsync(Guid userGuid);
        Task<UserSettingsResponseDto?> GetUserSettingsAsync(Guid userGuid);
        Task<UserSettingsResponseDto> UpdateUserSettingsAsync(Guid userGuid, UpdateUserSettingsRequestDto dto);
        Task<string> UploadAvatarAsync(Guid userGuid, Stream fileStream, string contentType, CancellationToken ct);
        Task<(Stream stream, string contentType)?> GetAvatarAsync(Guid userGuid, CancellationToken ct);

    }
}
