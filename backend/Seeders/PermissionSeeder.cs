using backend.Context;
using backend.Helper;
using backend.Models;
using Microsoft.EntityFrameworkCore;

namespace backend.Seeders
{
    public static class PermissionSeeder
    {
        public static async Task SeedAsync(VoxlockDbContext db)
        {
            foreach (var permName in AppPermissions.All)
            {
                bool exists = await db.Permissions.AnyAsync(p => p.Name == permName);

                if (!exists)
                {
                    var permission = new Permissions
                    {
                        PermissionGuid = Guid.NewGuid(),
                        Name = permName,
                        Category = permName.Split('_')[0],
                        Description = permName.Replace("_", " ")
                    };

                    db.Permissions.Add(permission);
                }
            }

            await db.SaveChangesAsync();
        }
    }
}
