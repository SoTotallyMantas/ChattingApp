namespace backend.Models
{
    public class ServerUserRoles
    {
        public Guid ServerGuid {  get; set; }
        public Guid UserGuid { get; set; }
        public Guid RoleGuid { get; set; }
        public DateTime AddedAt { get; set; }

       public Servers Server { get; set; } = default!;
       public Users User { get; set; } = default!;

        public ServerRoles Role { get; set; } = default!;
    }
}
