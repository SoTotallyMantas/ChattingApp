namespace backend.DTO.AdminDtos
{
    public class WhitelistEntryResponseDto
    {
        public Guid WhitelistGuid { get; set; }
        public required string Email { get; set; }
        public DateTime AddedAt { get; set; }
        public Guid AddedBy { get; set; }
    }

    public class CreateWhitelistEntryRequestDto
    {
        public required string Email { get; set; }
    }
}
