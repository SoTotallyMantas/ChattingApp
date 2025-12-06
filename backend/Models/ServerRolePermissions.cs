namespace backend.Models
{
    public class ServerRolePermissions
    {
        public Guid RoleGuid {  get; set; }
        public Guid PermissionsGuid {  get; set; }

        public ServerRoles Role { get; set; } = default!;
        public Permissions Permission { get; set; } = default!;
    }
}
