using backend.DTO.RoleDtos;
using backend.DTO.ServerDtos;
using System.Security.Claims;

namespace backend.Interfaces
{
    public interface IServerRolesService
    {
        Task AssignRoleToUserAsync(Guid serverGuid, Guid roleGuid, AssignRoleRequestDto dto, ClaimsPrincipal user);
        Task<ServerRoleResponseDto> CreateRoleAsync(Guid serverGuid, CreateRoleRequestDto dto, ClaimsPrincipal user);
        Task DeleteServerRoleAsync(Guid serverGuid, Guid roleGuid, ClaimsPrincipal user);
        Task<List<ServerMemberResponseDto>> GetMembersWithRoleAsync(Guid serverGuid, Guid roleGuid, ClaimsPrincipal user);
        Task<List<ServerRoleResponseDto>> GetServerRolesAsync(Guid serverGuid, ClaimsPrincipal user);
        Task RemoveRoleFromUserAsync(Guid serverGuid, Guid roleGuid, RemoveRoleRequestDto dto, ClaimsPrincipal user);
        Task UpdateRolePermissionsAsync(Guid serverGuid, Guid roleGuid, UpdateRolePermissionsRequestDto dto, ClaimsPrincipal user);
        Task<ServerRoleResponseDto> UpdateRoleAsync(Guid serverGuid, EditRoleRequestDto dto, ClaimsPrincipal user);
    }
}
