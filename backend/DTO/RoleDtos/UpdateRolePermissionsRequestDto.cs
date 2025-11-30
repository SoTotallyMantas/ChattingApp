namespace backend.DTO.RoleDtos
{
    public class UpdateRolePermissionsRequestDto
    {
        public Guid RoleId { get; set; }
        public List<Guid> PermissionsGuid { get; set; } = new();
    }
}
