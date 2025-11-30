namespace backend.DTO.ChannelDtos
{
    public class EditChannelRequestDto
    {
        public Guid ChannelId { get; set; }
        public required string ChannelName { get; set; }
        public Guid? ParentId { get; set; }
        public int Position { get; set; }
    }
}
