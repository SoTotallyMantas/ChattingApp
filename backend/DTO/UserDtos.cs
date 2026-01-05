namespace backend.DTO.UserDtos
{
    public class UserProfileDto
    {
        public string? DisplayName { get; set; }
        public string? AvatarKey { get; set; }
    }

    public class UserResponseDto
    {
        public Guid UserGuid { get; set; }
        public required string DisplayName { get; set; }
        public required string UserName { get; set; }
        public string? AvatarKey { get; set; }
        public string? Presence { get; set; }
    }
}

namespace backend.DTO.SettingsDtos
{
    public class UpdateUserSettingsRequestDto
    {
        public string Theme { get; set; } = "light";
        public bool MuteNotifications { get; set; }
        public string? DisplayName { get; set; }
    }

    public class UserSettingsResponseDto
    {
        public required string Theme { get; set; }
        public bool MuteNotifications { get; set; }
        public required string DisplayName { get; set; }
    }
}
