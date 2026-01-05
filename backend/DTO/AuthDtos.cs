namespace backend.DTO.AuthDtos
{
    public class AuthResponseDto
    {
        public Guid UserGuid { get; set; }
        public required string DisplayName { get; set; }
        public string? AvatarKey { get; set; }
        public required string Token { get; set; }
        public string? RefreshToken { get; set; } = null;
    }

    public class ChangePasswordRequestDto
    {
        public required string CurrentPassword { get; set; }
        public required string NewPassword { get; set; }
    }

    public class DeleteAccountRequestDto
    {
        public required string Password { get; set; }
    }

    public class LoginRequestDto
    {
        public string? Email { get; set; }
        public string? UserName { get; set; }
        public required string Password { get; set; }
    }

    public class RegisterRequestDto
    {
        public required string DisplayName { get; set; }
        public required string UserName { get; set; }
        public required string Email { get; set; }
        public required string Password { get; set; }
    }
}
