namespace backend.DTO.VoiceStateDtos
{
    public class UpdateVoiceStateRequestDto
    {
        public bool IsMuted { get; set; }
        public bool IsDeafened { get; set; }
        public bool IsVideoOn { get; set; }
        public bool IsStreaming { get; set; }
    }
}
