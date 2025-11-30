namespace backend.DTO.InviteDtos
{
    public class InviteResponseDto
    {
        public Guid InviteGuid { get; set; }
        public Guid ServerGuid { get; set; }
        public required string InviteCode { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime ExpiresAt { get; set; }
        public int MaxUses { get; set; }
        public int Uses { get; set; }
        
    }
}
