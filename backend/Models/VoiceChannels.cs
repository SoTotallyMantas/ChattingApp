namespace backend.Models
{
    public class VoiceChannels
    {
        public Guid ChannelGuid { get; set; }
        public int CurrentJanusRoomId { get; set; }
        public DateTime LastActiveAt { get; set; }

        public Channels Channel { get; set; } = default!;
    }
}
