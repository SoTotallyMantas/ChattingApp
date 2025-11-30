namespace backend.DTO.MessageDtos
{
    public class MessageAttachmentResponseDto
    {
        public Guid AttachmentGuid { get; set; }
        public required string FileName { get; set; }
        public required string Url { get; set; }
        public long SizeBytes { get; set; }
        public required string ContentType { get; set; }

    }
}
