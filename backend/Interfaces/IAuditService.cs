using backend.DTO.ServerDtos;
using System.Security.Claims;

namespace backend.Interfaces
{
    public interface IAuditService
    {
        Task AddAuditLogAsync(Guid serverGuid, Guid performedByGuid, string action);
        Task<List<ServerAuditLogEntryResponseDto>> GetServerAuditLogsAsync(Guid serverGuid, ClaimsPrincipal user);
    }
}
