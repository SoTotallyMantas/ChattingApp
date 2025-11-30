namespace backend.DTO.RoleDtos
{
    public class AssignRoleRequestDto
    {
        public Guid ServerGuid { get; set; }
        public Guid UserGuid { get; set; }
        public Guid RoleGuid { get; set; }

    }
}
