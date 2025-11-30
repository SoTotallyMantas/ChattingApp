using backend.DTO.PermissionsResponseDtos;

namespace backend.DTO.ServerDtos
{
    public class ServerRoleResponseDto
    {
        public Guid RoleGuid { get; set; }
        public required string RoleName { get; set; }
        public string? Color { get; set; }
        public int Position { get; set; }
        public bool IsDefault { get; set; } 
        public List<PermissionResponseDto> Permissions { get; set; } = new();
    }
}
