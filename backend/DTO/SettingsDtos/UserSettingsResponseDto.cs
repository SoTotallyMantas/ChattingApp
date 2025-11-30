namespace backend.DTO.SettingsDtos
{
    public class UserSettingsResponseDto
    {
        public required string Theme { get; set; }
        public bool MuteNotifications { get; set; }
    }
}
