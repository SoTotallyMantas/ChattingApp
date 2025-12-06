namespace backend.DTO.ChannelDtos
{
    public class CreateChannelRequestDto
    {
        public Guid ServerGuid { get; set; }
        public required string ChannelName { get; set; }
        public required string ChannelType { get; set; }
        public Guid? ParentGuid { get; set; }
        public int Position { get; set; }

    }
}
