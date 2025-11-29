namespace backend.Models
{
    public class Messages
    {
        public Guid MessageGuid { get; set; }
        public Guid ChannelGuid { get; set; }
        public Guid UserGuid { get; set; }
        public string Content { get; set; } = default!;
        public DateTime CreatedAt { get; set; }
        public DateTime? EditedAt { get; set; }
        public Guid ReplyToldGuid { get; set; }

        public Channels Channel { get; set; } = default!;
        public Users User { get; set; } = default!;
        public Messages? ReplyTo { get; set; }

    }
}
