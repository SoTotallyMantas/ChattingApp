namespace backend.DTO.MessageDtos
{
    public class MessageResponseDto
    {
        public Guid MessageGuid { get; set; }
        public Guid ChannelGuid { get; set; }
        public Guid UserGuid { get; set; }
        public string? DisplayName { get; set; }
        public string? UserName { get; set; }
        public string? AvatarUrl { get; set; }
        public required string Content { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? EditedAt { get; set; }
        public Guid? ReplyToGuid { get; set; }
        public List<MessageAttachmentResponseDto> Attachments { get; set; } = new();
    }
}
