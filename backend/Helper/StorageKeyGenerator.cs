namespace backend.Helper
{
    public static class StorageKeyGenerator
    {
        public static string UserAvatar(Guid userGuid)
        {
            var unique = Guid.NewGuid().ToString("N");
            return $"users/{userGuid}/avatar/{unique}";
        }

        public static string ServerIcon(Guid serverGuid)
        {
            var unique = Guid.NewGuid().ToString("N");
            return $"servers/{serverGuid}/icon/{unique}";
        }
        public static string MessageAttachment(Guid channelGuid, Guid messageGuid, Guid attachmentGuid)
        {
            return $"channels/{channelGuid}/messages/{messageGuid}/{attachmentGuid}";
        }
    }
}
