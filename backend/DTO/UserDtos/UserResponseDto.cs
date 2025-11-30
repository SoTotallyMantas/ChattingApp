namespace backend.DTO.UserDtos
{
    public class UserResponseDto
    {
        public Guid UserGuid { get; set; }  
        public required string DisplayName { get; set; }
        public required string UserName { get; set; }
        public string? AvatarUrl { get; set; }

    }
}
