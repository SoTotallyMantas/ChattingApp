namespace backend.DTO.FriendDtos
{
    public class CreateFriendRequestDto
    {
        public Guid FriendGuid { get; set; }
    }

    public class FriendResponseDto
    {
        public Guid FriendshipGuid { get; set; }
        public Guid FriendGuid { get; set; }
        public required string UserName { get; set; }
        public required string DisplayName { get; set; }
        public string? AvatarKey { get; set; }
        public string? Presence { get; set; }
        public required string RelationshipStatus { get; set; }
        public DateTime CreatedAt { get; set; }
        public bool IsIncoming { get; set; }
        public bool IsOutgoing { get; set; }
    }
}
