namespace backend.Models
{
    public class Friendships
    {
        public Guid FriendshipGuid { get; set; }
        public Guid RequesterGuid { get; set; }
        public Guid AddresseeGuid { get; set; }
        public string Status { get; set; } = default!;
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }

        public Users Requester { get; set; } = default!;
        public Users Addressee { get; set; } = default!;
        public Guid? BlockedByGuid { get; set; }
    }

    public static class FriendshipStatuses
    {
        public const string Pending = "pending";
        public const string Accepted = "accepted";
        public const string Blocked = "blocked";
    }
}
