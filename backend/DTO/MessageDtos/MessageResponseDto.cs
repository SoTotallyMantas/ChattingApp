namespace backend.DTO.MessageDtos
{
    public class MessageResponseDto
    {
        public Guid MessageGuid { get; set; }
        public Guid ChannelGuid { get; set; }
        public Guid AuthorGuid { get; set; }
        public required string Content { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? EditedAt { get; set; }
        public MessageReplyResponseDto? ReplyTo { get; set; }
        public List<MessageAttachmentResponseDto> Attachments { get; set; } = new();
    }
}
