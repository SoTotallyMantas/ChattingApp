namespace backend.DTO.AuthDtos
{
    public class RegisterRequestDto
    {
        public required string DisplayName { get; set; }
        public required string UserName { get; set; }
        public required string Email { get; set; }
        public required string Password { get; set; }
    }
}
