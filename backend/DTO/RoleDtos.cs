namespace backend.DTO.RoleDtos
{
    public class AssignRoleRequestDto
    {
        public Guid UserGuid { get; set; }
    }

    public class CreateRoleRequestDto
    {
        public required string RoleName { get; set; }
        public string? Color { get; set; }
        public bool IsAdmin { get; set; }
        public int Position { get; set; }
        public List<Guid> PermissionGuids { get; set; } = new();
    }

    public class EditRoleRequestDto
    {
        public Guid RoleGuid { get; set; }
        public required string RoleName { get; set; }
        public required string RoleColor { get; set; }
        public int Position { get; set; }
        public List<Guid> PermissionIds { get; set; } = new();
    }

    public class RemoveRoleRequestDto
    {
        public Guid UserGuid { get; set; }
    }

    public class ReorderRolesRequestDto
    {
        public List<RoleOrderItemDto> Order { get; set; } = new();
    }

    public class RoleOrderItemDto
    {
        public Guid RoleGuid { get; set; }
        public int Position { get; set; }
    }

    public class UpdateRolePermissionsRequestDto
    {
        public List<Guid> PermissionsGuid { get; set; } = new();
    }
}

namespace backend.DTO.PermissionsResponseDtos
{
    public class PermissionResponseDto
    {
        public Guid PermissionGuid { get; set; }
        public required string PermissionName { get; set; }
        public required string Description { get; set; }
        public required string Category { get; set; }
    }
}
