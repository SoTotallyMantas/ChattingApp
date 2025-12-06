namespace backend.Models
{
    public class UserSettings
    {
        public Guid UserSettingsGuid { get; set; }
        public Guid UserGuid { get; set; }
        public string Theme { get; set; } = "light";
        public bool MuteNotifications { get; set; } = false;

        public Users User { get; set; } = default!;
    }
}
