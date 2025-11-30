namespace backend.DTO.AuthDtos
{
    public class LoginRequestDto
    {
        public string? Email { get; set; }
        public string? UserName { get; set; }
        public required string Password { get; set; }
    }
}
