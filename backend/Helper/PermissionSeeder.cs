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
                if (perm.StartsWith("MANAGE_") && perm.Contains("ROLES"))
                    return "Roles";
                if (perm.StartsWith("MANAGE_") && perm.Contains("CHANNELS"))
                    return "Channels";
                if (perm == AppPermissions.SEND_MESSAGES || perm == AppPermissions.MANAGE_MESSAGES)
                    return "Messages";
                if (perm == AppPermissions.KICK_MEMBERS || perm == AppPermissions.BAN_MEMBERS)
                    return "Moderation";
                if (perm == AppPermissions.CREATE_INVITES)
                    return "Invites";
                if (perm == AppPermissions.VIEW_AUDIT_LOG)
                    return "Audit";
                return "General";
            }
        }
    }
}

