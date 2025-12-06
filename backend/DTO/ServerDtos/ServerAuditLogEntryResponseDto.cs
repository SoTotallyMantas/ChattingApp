using backend.DTO.UserDtos;

namespace backend.DTO.ServerDtos
{
    public class ServerAuditLogEntryResponseDto
    {
        public Guid AuditLogEntryGuid { get; set; }
        public Guid ServerGuid { get; set; }
        public Guid PerformedByGuid { get; set; }
        public required string Action { get; set; }
        public required UserResponseDto PerformedBy { get; set; }
        public DateTime PerformedAt { get; set; }
  
        
    }
}
