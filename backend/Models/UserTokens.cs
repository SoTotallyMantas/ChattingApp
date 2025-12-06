namespace backend.Models
{
    public class UserTokens 
    {
        public Guid TokenGuid { get; set; }
        public Guid UserGuid { get; set; }
        public Users User { get; set; } = default!;
        public string Token { get; set; } = default!;
        public DateTime ExpiresAt { get; set; }
        public DateTime CreatedAt { get; set; }
        public bool IsRevoked { get; set; }
        public DateTime? RevokedAt { get; set; }
    }
}
