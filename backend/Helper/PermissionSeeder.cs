using backend.Models;

namespace backend.Helper
{
    public static class PermissionSeeder
    {
        public static class PermissionSeed
        {
            public static List<Permissions> All = AppPermissions.All.Select(name =>
                new Permissions
                {
                    PermissionGuid = Guid.NewGuid(),
                    Name = name,
                    Category = GetCategory(name)
                }
            ).ToList();

            private static string GetCategory(string perm)
            {
                if (perm == AppPermissions.MANAGE_ROLES)
                    return "Roles";
                if (perm == AppPermissions.MANAGE_CHANNELS)
                    return "Channels";
                if (perm == AppPermissions.SEND_MESSAGES || perm == AppPermissions.MANAGE_MESSAGES)
                    return "Messages";
                if (perm == AppPermissions.KICK_MEMBERS || perm == AppPermissions.BAN_MEMBERS)
                    return "Moderation";
                if (perm == AppPermissions.CREATE_INVITES)
                    return "Invites";
                return "General";
            }
        }
    }
}
