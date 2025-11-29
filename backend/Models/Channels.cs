namespace backend.Models
{
    public class Channels
    {
        public Guid ChannelGuid { get; set; }
        public string ChannelName { get; set; } = default!;

        public Guid ServerGuid { get; set; }

        public Guid ParentGuid { get; set; }

        public string Type { get; set; } = default!;

        public Servers Servers { get; set; } = default!;
        public Channels? Parent { get; set; }
        public VoiceChannels? VoiceChannels { get; set; }
    }
}
