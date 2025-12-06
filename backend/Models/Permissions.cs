namespace backend.Models
{
    public class Permissions
    {
        public Guid PermissionGuid { get; set; }
        public string Name { get; set; } = default!;
        public string? Description { get; set; }

        public required string Category { get; set; }
    }
}
