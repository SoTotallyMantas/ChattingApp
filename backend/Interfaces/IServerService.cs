using backend.DTO.ChannelDtos;
using backend.DTO.InviteDtos;
using backend.DTO.KickBanDtos;
using backend.DTO.RoleDtos;
using backend.DTO.ServerDtos;
using System.Security.Claims;

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
        
    }
}
