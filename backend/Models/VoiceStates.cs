namespace backend.Models
{
    public class VoiceStates
    {
        public Guid VoiceStateGuid { get; set; }
        public Guid ChannelGuid {  get; set; }
        public Guid UserGuid { get; set; }
        public DateTime JoinedAt { get; set;  }
        public bool IsMuted { get; set; }
        public bool IsDeafened { get; set; }
        public bool IsVideo { get; set; }

        public Channels Channel { get; set; } = default!;
        public Users User { get; set; } = default!;
    }
}
