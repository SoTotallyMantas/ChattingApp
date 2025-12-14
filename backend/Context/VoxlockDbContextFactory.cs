using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;

namespace backend.Context
{
    // Provides a DbContext for design-time tools (dotnet ef) with pgvector enabled.
    public class VoxlockDbContextFactory : IDesignTimeDbContextFactory<VoxlockDbContext>
    {
        public VoxlockDbContext CreateDbContext(string[] args)
        {
            var builder = new DbContextOptionsBuilder<VoxlockDbContext>();

            var connectionString =
                Environment.GetEnvironmentVariable("DB_CONNECTION") ??
                $"Host={Environment.GetEnvironmentVariable("DB_HOST") ?? "localhost"};" +
                $"Port={Environment.GetEnvironmentVariable("DB_PORT") ?? "5432"};" +
                $"Database={Environment.GetEnvironmentVariable("DB_NAME") ?? "voxlock"};" +
                $"Username={Environment.GetEnvironmentVariable("DB_USER") ?? "postgres"};" +
                $"Password={Environment.GetEnvironmentVariable("DB_PASS") ?? "postgres"};";

            builder.UseNpgsql(connectionString, o => o.UseVector());

            return new VoxlockDbContext(builder.Options);
        }
    }
}
