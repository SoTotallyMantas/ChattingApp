using backend.DTO.ChannelDtos;
using backend.DTO.InviteDtos;
using backend.DTO.KickBanDtos;
using backend.DTO.RoleDtos;
using backend.DTO.ServerDtos;
using System.Security.Claims;
using System.IO;

namespace backend.Interfaces
{
    public interface IServerService
    {
        Task<ServerResponseDto> CreateServerAsync(CreateServerRequestDto dto, ClaimsPrincipal user);
        Task DeleteServerAsync(Guid serverGuid, ClaimsPrincipal user);
        Task<List<ServerResponseDto>> GetMyServersAsync(ClaimsPrincipal user);
        Task<ServerResponseDto> GetServerByGuidAsync(Guid serverGuid, ClaimsPrincipal user);
        Task LeaveServerAsync(Guid serverGuid, ClaimsPrincipal user);
        Task<ServerResponseDto> UpdateServerAsync(Guid serverGuid, EditServerRequestDto dto, ClaimsPrincipal user);
        Task<(Stream stream, string contentType)?> GetServerIconAsync(Guid serverGuid, CancellationToken ct);
        Task<string> UploadServerIconAsync(Guid serverGuid, ClaimsPrincipal user, Stream fileStream, string contentType, CancellationToken ct);
    }
}
