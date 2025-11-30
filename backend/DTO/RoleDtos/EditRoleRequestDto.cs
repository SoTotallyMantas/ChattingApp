namespace backend.DTO.RoleDtos
{
    public class EditRoleRequestDto
    {
        public Guid RoleId { get; set; }
        public required string RoleName { get; set; }
        public required string RoleColor { get; set; }
        public int Position { get; set; }
        public List<Guid> PermissionIds { get; set; } = new();
    }
}
