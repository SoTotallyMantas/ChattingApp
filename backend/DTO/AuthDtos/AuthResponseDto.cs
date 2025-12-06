namespace backend.DTO.AuthDtos
{
    public class AuthResponseDto
    {
        public Guid UserGuid { get; set; }
        public required string DisplayName { get; set; }
        public string? AvatarUrl { get; set; }
        public required string Token { get; set; }
        public string? RefreshToken { get; set; } = null;
    }
}
