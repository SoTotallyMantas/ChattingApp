namespace backend.DTO.ServerDtos
{
    public class CreateServerRequestDto
    {
        public required string ServerName { get; set; }
        public string? IconUrl { get; set; }
    }
}
