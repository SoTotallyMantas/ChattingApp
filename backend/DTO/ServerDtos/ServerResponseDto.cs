using backend.DTO.ChannelDtos;

namespace backend.DTO.ServerDtos
{
    public class ServerResponseDto
    {
        public Guid ServerGuid { get; set; }
        public required string ServerName { get; set; }
        public Guid OwnerGuid { get; set; }
        public string? IconUrl { get; set; }
        public List<ChannelResponseDto> Channels { get; set; } = new();
        public List<ServerRoleResponseDto> Roles { get; set; } = new();
        public List<ServerMemberResponseDto> Members { get; set; } = new();
    }
}
