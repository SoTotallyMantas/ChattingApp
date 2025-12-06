namespace backend.Models
{
        public class ServerAuditLog
        {
            public Guid AuditGuid { get; set; }
            public Guid ServerGuid { get; set; }
            public Guid PerformedBy { get; set; }
            public string Action { get; set; } = default!;
            public DateTime Timestamp { get; set; } 
            public Servers Server { get; set; } =default!;
            public Users PerformedByUser { get; set; } = default!;
        }
}
