namespace backend.Models
{
    public class Servers
    {
        public Guid ServerGuid { get; set; }
        public string ServerName { get; set; } = default!;
        public Guid OwnerGuid { get; set; }
        public string? IconKey { get; set; }
        public DateTime CreatedAt { get; set; }

        public Users Owner { get; set; } = default!;
        public ICollection<Channels> Channels { get; set; } = [];
        public ICollection<ServerRoles> Roles {  get; set; } = [];
        public ICollection<ServerMembers> Members { get; set; } = [];
    }
}
