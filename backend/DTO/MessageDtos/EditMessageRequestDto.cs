namespace backend.DTO.MessageDtos
{
    public class EditMessageRequestDto
    {
        public Guid MessageGuid { get; set; }
        public required string NewContent { get; set; }
    }
}
