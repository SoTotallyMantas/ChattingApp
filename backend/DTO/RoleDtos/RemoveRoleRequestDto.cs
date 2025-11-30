namespace backend.DTO.RoleDtos
{
    public class RemoveRoleRequestDto
    {
        public Guid ServerGuid { get; set; }
        public Guid RoleGuid { get; set; }
        public Guid UserGuid { get; set; }
    }
}
