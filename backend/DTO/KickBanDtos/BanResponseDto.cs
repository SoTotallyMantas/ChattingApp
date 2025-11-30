using backend.DTO.UserDtos;

namespace backend.DTO.KickBanDtos
{
    public class BanResponseDto
    {
        public Guid BanGuid { get; set; }
        public required UserResponseDto User { get; set; }
        public required UserResponseDto BannedBy { get; set; }
        public string? Reason { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}
