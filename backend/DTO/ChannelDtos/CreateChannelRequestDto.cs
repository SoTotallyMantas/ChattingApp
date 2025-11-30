namespace backend.DTO.ChannelDtos
{
    public class CreateChannelRequestDto
    {
        public Guid ServerId { get; set; }
        public required string ChannelName { get; set; }
        public required string ChannelType { get; set; }
        public Guid? ParentId { get; set; }
        public int Position { get; set; }

    }
}
