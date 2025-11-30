namespace backend.DTO.MessageDtos
{
    public class MessageReplyResponseDto
    {
        public Guid MessageGuid { get; set; }
        public Guid AuthorGuid { get; set; }
        public required string Content { get; set; }
    }
}
