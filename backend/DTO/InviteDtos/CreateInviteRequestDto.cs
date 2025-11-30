namespace backend.DTO.InviteDtos
{
    public class CreateInviteRequestDto
    {
        public Guid ServerGuid { get; set; }
        public int MaxUses { get; set; }
        public DateTime? ExpiresAt { get; set; }
    }
}
