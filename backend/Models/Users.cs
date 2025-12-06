using Microsoft.AspNetCore.Mvc;

namespace backend.Models
{
    public class Users
    {
        public Guid UserGuid { get; set; }
        public string UserName { get; set; } = default!;
        public string DisplayName { get; set; } = default!;
        public string Email { get; set; } = default!;
        public string PasswordHash { get; set; } = default!;
        public string PasswordSalt { get; set; } = default!;
        public DateTime CreatedAt { get; set; }
        public string? Status { get; set; }
        public string? AvatarURL { get; set; }
        public bool IsDeleted { get; set; } = false;
        public DateTime? DeletedAt { get; set; }
        public UserSettings Settings { get; set; } = default!;
        
        public ICollection<ServerMembers> ServerMembers { get; set; } = [];

        public ICollection<ServerUserRoles> ServerUserRoles { get; set; } = [];

        public ICollection<Servers> OwnedServers { get; set; } = [];

        public ICollection<Messages> Messages { get; set; } = [];

    }
}
