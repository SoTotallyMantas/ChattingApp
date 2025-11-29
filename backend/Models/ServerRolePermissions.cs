namespace backend.Models
{
    public class ServerRolePermissions
    {
        public Guid RoleId {  get; set; }
        public Guid PermissionsId {  get; set; }

        public ServerRoles Role { get; set; } = default!;
        public Permissions Permission { get; set; } = default!;
    }
}
