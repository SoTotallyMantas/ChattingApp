using backend.DTO.ChannelDtos;
using backend.DTO.UserDtos;

namespace backend.DTO.DmDtos
{
    public class DmServerResponseDto
    {
        public Guid ServerGuid { get; set; }
        public required string ServerName { get; set; }
        public Guid OwnerGuid { get; set; }
        public string? IconKey { get; set; }
        public bool IsDirect { get; set; } = true;
    }

    public class DmThreadResponseDto
    {
        public required DmServerResponseDto Server { get; set; }
        public required ChannelResponseDto Channel { get; set; }
        public required UserResponseDto Friend { get; set; }
    }
}
