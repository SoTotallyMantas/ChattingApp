namespace backend.Models
{
    public class ChannelEncryptionKey
    {
        public Guid ChannelEncryptionKeyGUID { get; set; }
        public Guid ChannelGuid { get; set; }

        public byte[] EncryptedKey { get; set; } = default!;

        public DateTime CreatedAt { get; set; }

        public Channels Channel { get; set; } = default!;

    }
}
