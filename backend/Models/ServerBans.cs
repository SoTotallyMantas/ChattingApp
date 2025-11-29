namespace backend.Models
{
    public class ServerBans
    {
        public Guid BanGuid {  get; set; }
        public Guid ServerGuid { get; set; }
        public Guid UserGuid { get; set; }
        public Guid BannedByGuid { get; set; }
        public string? Reason { get; set; }
        public DateTime CreatedAt {  get; set; }

        public Servers Server { get; set; } = default!;
        public Users User { get; set; } = default!;
        public Users BannedByUser { get; set; } = default!;

    }
}
