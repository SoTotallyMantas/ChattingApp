namespace backend.DTO.SettingsDtos
{
    public class UpdateUserSEttingsRequestDto
    {
        public required string Theme { get; set; }
        public bool MuteNotifications { get; set; }

    }
}
