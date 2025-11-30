using backend.DTO.UserDtos;

namespace backend.DTO.ServerDtos
{
    public class ServerMemberResponseDto
    {
        public required UserResponseDto User { get; set; }
        public List<ServerRoleResponseDto> Roles { get; set; } = new();
    }
}
