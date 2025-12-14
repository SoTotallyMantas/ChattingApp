namespace backend.DTO.VoiceStateDtos
{
    public class UpdateVoiceStateRequestDto
    {
        public bool IsMuted { get; set; }
        public bool IsDeafened { get; set; }
        public bool IsVideoOn { get; set; }
        public bool IsStreaming { get; set; }
    }

    public class VoiceStateResponseDto
    {
        public Guid UserGuid { get; set; }
        public Guid ChannelGuid { get; set; }
        public bool IsMuted { get; set; }
        public bool IsDeafened { get; set; }
        public bool IsVideoOn { get; set; }
        public bool IsStreaming { get; set; }
    }

    public class VoiceUserDto
    {
        public Guid UserGuid { get; set; }
        public Guid ChannelGuid { get; set; }
        public bool IsMuted { get; set; }
        public bool IsDeafened { get; set; }
        public string? DisplayName { get; set; }
        public string? AvatarKey { get; set; }
    }
}
