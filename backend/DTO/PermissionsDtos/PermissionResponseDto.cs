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
