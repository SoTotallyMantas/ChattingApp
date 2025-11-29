using Microsoft.AspNetCore.Mvc;

namespace backend.Models
{
    public class Users
    {
        public Guid UserGuid { get; set; }
        public string UserName { get; set; } = default!;
        public string Email { get; set; } = default!;
        public string PaswordHash { get; set; } = default!;
        public DateTime CreatedAt { get; set; }
        public string? Status { get; set; }
        public string? AvatarURL { get; set; }

        public UserSettings Settings { get; set; } = default!;
        
        public ICollection<ServerMembers> ServerMembers { get; set; } = [];

        public ICollection<ServerUserRoles> ServerUserRoles { get; set; } = [];

    }
}
