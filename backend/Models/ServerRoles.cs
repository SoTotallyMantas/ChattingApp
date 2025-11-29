namespace backend.Models
{
    public class ServerRoles
    {
        public Guid RoleGuid { get; set; }
        public Guid ServerGuid { get; set; }
        public string RoleName { get; set; } = default!;

        public string? Color { get; set; }
        
        public bool IsAdmin { get; set; }
        public bool IsDefault { get; set; }

        public int Position { get; set; }

        public Servers Server { get; set; } = default!;
        public ICollection<ServerRolePermissions> RolePermissions { get; set; } = [];
        public ICollection<ServerUserRoles> UserRoles { get; set; } = [];


    }
}
