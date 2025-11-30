namespace backend.DTO.AttachmentsDto
{
    public class UploadAttachmentMetadataDto
    {
        public Guid ChannelGuid { get; set; }
        public string? Content { get; set; }
        public Guid? ReplytoGuid { get; set; }
    }
}
