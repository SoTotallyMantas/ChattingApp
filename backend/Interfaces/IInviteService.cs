using backend.DTO.InviteDtos;
using System.Security.Claims;

namespace backend.Interfaces
{
    public interface IInviteService
    {
        Task<InviteResponseDto> CreateInviteAsync(Guid serverGuid, CreateInviteRequestDto dto, ClaimsPrincipal user);
        Task<List<InviteResponseDto>> GetInvitesAsync(Guid serverGuid, ClaimsPrincipal user);
        Task JoinServerViaInviteAsync(Guid inviteGuid, ClaimsPrincipal user);
        Task RevokeInviteAsync(Guid inviteGuid, ClaimsPrincipal user);
    }
}
