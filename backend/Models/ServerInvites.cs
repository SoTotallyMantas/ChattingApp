namespace backend.Models
{
    public class ServerInvites
    {
        public Guid InviteGuid { get; set; }
        public Guid ServerGuid {  get; set; }
        public Guid CreatedByGuid { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime ExpiresAt {  get; set; }
        public int MaxUses { get; set; }
        public int Uses { get; set; }

        public Servers Server { get; set; } = default!;
        public Users Creator { get; set; } = default!;
    }
}
