namespace backend.Helper
{
    public static class AppPermissions
    {
        // General
        public const string MANAGE_SERVER = "MANAGE_SERVER";

        // Channels
        public const string MANAGE_CHANNELS = "MANAGE_CHANNELS";

        // Roles
        public const string MANAGE_ROLES = "MANAGE_ROLES";

        // Messages
        public const string SEND_MESSAGES = "SEND_MESSAGES";
        public const string MANAGE_MESSAGES = "MANAGE_MESSAGES";

        // Invites
        public const string CREATE_INVITES = "CREATE_INVITES";

        // Moderation
        public const string KICK_MEMBERS = "KICK_MEMBERS";
        public const string BAN_MEMBERS = "BAN_MEMBERS";

        // Helper: list of all permissions
        public static readonly string[] All =
        {
            MANAGE_SERVER,
            MANAGE_CHANNELS,
            MANAGE_ROLES,
            SEND_MESSAGES,
            MANAGE_MESSAGES,
            CREATE_INVITES,
            KICK_MEMBERS,
            BAN_MEMBERS
        };
    }
}
