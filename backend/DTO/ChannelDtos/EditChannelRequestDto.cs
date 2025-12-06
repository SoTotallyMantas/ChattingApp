namespace backend.DTO.ChannelDtos
{
    public class EditChannelRequestDto
    {
        public Guid ChannelGuid { get; set; }
        public required string ChannelName { get; set; }
        public string ChannelType { get; set; } = string.Empty;
        public Guid? ParentGuid { get; set; }
        public int Position { get; set; }
    }
}
