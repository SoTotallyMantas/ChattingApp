namespace backend.DTO.RoleDtos
{
    public class CreateRoleRequestDto
    {
        public Guid ServerGuid { get; set; }
        public required string RoleName { get; set; }
        public string? Color { get; set; }
        public bool IsAdmin { get; set; }
        public int Position { get; set; }
        public List<Guid> PermissionGuids { get; set; } = new();

    }
}
