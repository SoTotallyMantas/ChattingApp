namespace backend.DTO.VoiceStateDtos
{
    public class VoiceStateResponseDto
    {

        public Guid UserGuid { get; set; }
        public Guid ChannelGuid { get; set; }
        public bool IsMuted { get; set; }
        public bool IsDeafened { get; set; }
        public bool IsVideoOn { get; set; }
        public bool IsStreaming { get; set; }
    }
}
