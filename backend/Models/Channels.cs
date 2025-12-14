namespace backend.Models
{
    public class Channels
    {
        public Guid ChannelGuid { get; set; }
        public string ChannelName { get; set; } = default!;

        public Guid ServerGuid { get; set; }

        public Guid? ParentGuid { get; set; }
        public int Position { get; set; }
        public Channels? Parent { get; set; }
        public ICollection<Channels> Children { get; set; } = [];

        public string Type { get; set; } = default!;

        public Servers Servers { get; set; } = default!;
      
        public VoiceChannels? VoiceChannels { get; set; }
        public ICollection<Messages> Messages { get; set; } = [];

        public ChannelEncryptionKey EncryptionKey { get; set; } = default!;
    }
}
