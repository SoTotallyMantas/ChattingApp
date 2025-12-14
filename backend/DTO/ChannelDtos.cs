namespace backend.DTO.ChannelDtos
{
    public class ChannelResponseDto
    {
        public Guid ChannelGuid { get; set; }
        public Guid ServerGuid { get; set; }
        public required string ChannelName { get; set; }
        public required string ChannelType { get; set; }
        public Guid? ParentGuid { get; set; }
        public int Position { get; set; }
    }

    public class CreateChannelRequestDto
    {
        public required string ChannelName { get; set; }
        public required string ChannelType { get; set; }
        public Guid? ParentGuid { get; set; }
        public int Position { get; set; }
    }

    public class EditChannelRequestDto
    {
        public required string ChannelName { get; set; }
        public string ChannelType { get; set; } = string.Empty;
        public Guid? ParentGuid { get; set; }
        public int Position { get; set; }
    }
}
