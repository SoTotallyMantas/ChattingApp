using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;

namespace backend.Context
{
    public class VoxlockDbContextFactory : IDesignTimeDbContextFactory<VoxlockDbContext>
    {
        public VoxlockDbContext CreateDbContext(string[] args)
        {
           var builder = new DbContextOptionsBuilder<VoxlockDbContext>();
            var connectionString =
                $"Host={Environment.GetEnvironmentVariable("DB_HOST")};" +
                $"Port={Environment.GetEnvironmentVariable("DB_PORT")};" +
                $"Database={Environment.GetEnvironmentVariable("DB_NAME")};" +
                $"Username={Environment.GetEnvironmentVariable("DB_USER")};" +
                $"Password={Environment.GetEnvironmentVariable("DB_PASS")};";

            builder.UseNpgsql(connectionString);

            return new VoxlockDbContext(builder.Options);
        }
    }
}
