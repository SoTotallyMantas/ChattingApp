using backend.DTO.KickBanDtos;
using backend.DTO.ServerDtos;
using System.Security.Claims;

namespace backend.Interfaces
{
    public interface IServerMemberService
    {
        Task BanUserFromServerAsync(Guid serverGuid, BanMemberRequestDto dto, ClaimsPrincipal user);
        Task<List<BanResponseDto>> GetServerBansAsync(Guid serverGuid, ClaimsPrincipal user);
        Task<List<ServerMemberResponseDto>> GetServerMembersAsync(Guid serverGuid, ClaimsPrincipal user);
        Task KickUserFromServerAsync(Guid serverGuid, KickMemberRequestDto dto, ClaimsPrincipal user);
        Task UnbanUserFromServerAsync(Guid serverGuid, UnbanMemberRequestDto dto, ClaimsPrincipal user);
    }
}
