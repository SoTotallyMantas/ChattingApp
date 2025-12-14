namespace backend.DTO.MessageDtos
{
    public class EditMessageRequestDto
    {
        public Guid MessageGuid { get; set; }
        public required string NewContent { get; set; }
    }

    public class MessageAttachmentResponseDto
    {
        public Guid AttachmentGuid { get; set; }
        public required string FileName { get; set; }
        public required string AttachmentKey { get; set; }
        public required string ContentType { get; set; }
        public long SizeBytes { get; set; }
    }

    public class MessageResponseDto
    {
        public Guid MessageGuid { get; set; }
        public Guid ChannelGuid { get; set; }
        public Guid UserGuid { get; set; }
        public string? DisplayName { get; set; }
        public string? UserName { get; set; }
        public string? AvatarKey { get; set; }
        public string? Content { get; set; } = default!;
        public DateTime CreatedAt { get; set; }
        public DateTime? EditedAt { get; set; }
        public Guid? ReplyToGuid { get; set; }
        public List<MessageAttachmentResponseDto> Attachments { get; set; } = new();
    }

    public class SendMessageRequestDto
    {
        public Guid ChannelGuid { get; set; }
        public required string Content { get; set; }
        public Guid? ReplyToGuid { get; set; }
    }
}

namespace backend.DTO.AttachmentsDto
{
    public class UploadAttachmentMetadataDto
    {
        public Guid ChannelGuid { get; set; }
        public string? Content { get; set; }
        public Guid? ReplytoGuid { get; set; }
    }
}
