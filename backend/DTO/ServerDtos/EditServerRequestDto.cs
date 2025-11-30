namespace backend.DTO.ServerDtos
{
    public class EditServerRequestDto
    {
        public Guid ServerGuid { get; set; }
        public required string ServerName { get; set; }
        public string? IconUrl { get; set; }
    }
}
