


using Amazon.S3;
using backend.Context;
using Microsoft.EntityFrameworkCore;
using Microsoft.OpenApi;
using StackExchange.Redis;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder.Services.AddControllers();

// Redis Cache Service
builder.Services.AddSingleton<IConnectionMultiplexer>(
    ConnectionMultiplexer.Connect("redis:6379")
    );
// Garage S3 Service
builder.Services.AddSingleton<IAmazonS3>(options =>
{

    return new AmazonS3Client(
        Environment.GetEnvironmentVariable("S3_KEY_ID"),
        Environment.GetEnvironmentVariable("S3_KEY_SECRET"),
        new AmazonS3Config
        {
            ServiceURL = Environment.GetEnvironmentVariable("S3_ENDPOINT"),
            ForcePathStyle = true,
            AuthenticationRegion = "garage"
        }
    );
});
var connectionString =
    $"Host={Environment.GetEnvironmentVariable("DB_HOST")};" +
    $"Port={Environment.GetEnvironmentVariable("DB_PORT")};" +
    $"Database={Environment.GetEnvironmentVariable("DB_NAME")};" +
    $"Username={Environment.GetEnvironmentVariable("DB_USER")};" +
    $"Password={Environment.GetEnvironmentVariable("DB_PASS")};";
builder.Services.AddDbContext<VoxlockDbContext>(options =>
{
    options.UseNpgsql(connectionString);
});

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen( options =>
{
    options.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "Voxlock API",
        Version = "v1",
    });
});
var app = builder.Build();

app.UseSwagger();
app.UseSwaggerUI(options =>
{
    options.SwaggerEndpoint("/swagger/v1/swagger.json", "Voxlock API v1");
});

app.UseHttpsRedirection();

app.UseAuthorization();

app.MapControllers();

app.Run();
