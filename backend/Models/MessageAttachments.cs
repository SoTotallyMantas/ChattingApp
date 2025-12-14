namespace backend.Models
{
    public class MessageAttachments
    {
        public Guid AttachementGuid { get; set; }
        public Guid MessageGuid { get; set; }
        public string AttachementKey { get; set; } = default!;
        public string Filename { get; set; } = default!;
        public string ContentType { get; set; } = default!;
        public long SizeBytes { get; set; } = default!;


        public Messages Messages { get; set; } = default!;
    }
}
