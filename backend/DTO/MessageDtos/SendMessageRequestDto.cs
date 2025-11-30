namespace backend.DTO.MessageDtos
{
    public class SendMessageRequestDto
    {
        public Guid ChannelGuid { get; set; }
        public required string Content { get; set; }
    }
}
