namespace backend.Helper
{
    public static class StorageKeyGenerator
    {
        public static string UserAvatar(Guid userGuid)
        {
            return $"users/{userGuid}/avatar";
        }

        public static string ServerIcon(Guid serverGuid)
        {
            return $"servers/{serverGuid}/icon";
        }
        public static string MessageAttachment(Guid channelGuid, Guid messageGuid, Guid attachmentGuid)
        {
            return $"channels/{channelGuid}/messages/{messageGuid}/{attachmentGuid}";
        }
    }
}
