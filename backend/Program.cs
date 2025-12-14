


using Amazon.S3;
using backend.Context;
using backend.Helper;
using backend.Hubs;
using backend.Interfaces;
using backend.Middleware;
using backend.Seeders;
using backend.Services;
using backend.Services.Server;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Diagnostics;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi;
using Pgvector;
using StackExchange.Redis;

var builder = WebApplication.CreateBuilder(args);
builder.Services.AddDbContext<VoxlockDbContext>(options =>
{
    var connectionString =
        $"Host={Environment.GetEnvironmentVariable("DB_HOST")};" +
        $"Port={Environment.GetEnvironmentVariable("DB_PORT")};" +
        $"Database={Environment.GetEnvironmentVariable("DB_NAME")};" +
        $"Username={Environment.GetEnvironmentVariable("DB_USER")};" +
        $"Password={Environment.GetEnvironmentVariable("DB_PASS")};";

    options.UseNpgsql(connectionString, o => o.UseVector());

    options.ConfigureWarnings(w =>
            w.Ignore(RelationalEventId.PendingModelChangesWarning)
            );
});
AppContext.SetSwitch("Npgsql.EnableLegacyTimestampBehavior", true);
builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.Events = new JwtBearerEvents
    {
        OnMessageReceived = context =>
        {
            var accessToken = context.Request.Query["access_token"];
            var path = context.HttpContext.Request.Path;

            if (!string.IsNullOrEmpty(accessToken) &&
                (path.StartsWithSegments("/hubs")))
            {
                context.Token = accessToken;
            }
            return Task.CompletedTask;
        }
    };

    options.TokenValidationParameters = new Microsoft.IdentityModel.Tokens.TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = false,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,

        ValidIssuer = "voxlock",
        IssuerSigningKey = new SymmetricSecurityKey(System.Text.Encoding.UTF8.GetBytes(Environment.GetEnvironmentVariable("JWT_SECRET_KEY")!))
    };
});

builder.Services.AddSignalR();
builder.Services.AddAuthorization();
builder.Services.AddControllers();
builder.Services.AddHttpContextAccessor();
builder.Services.AddScoped<IUserContext, UserContext>();
builder.Services.AddScoped<IUserService, UserService>();
builder.Services.AddScoped<IMessageService, MessageService>();
builder.Services.AddScoped<IInviteService, InviteService>();
builder.Services.AddScoped<IServerRolesService, ServerRolesService>();
builder.Services.AddScoped<IServerService, ServerService>();
builder.Services.AddScoped<IChannelService, ChannelService>();
builder.Services.AddScoped<IServerMemberService, ServerMembersService>();
builder.Services.AddScoped<ITokenService, TokenService>();
builder.Services.AddScoped<IPermissionEvualuator, PermissionEvaluator>();
builder.Services.AddScoped<IServerHelper, ServerHelper>();
builder.Services.AddScoped<IPermissionService, PermissionService>();
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IVoiceService, VoiceService>();
builder.Services.AddScoped<IS3StorageService, S3StorageService>();
builder.Services.AddScoped<IFriendService, FriendService>();
builder.Services.AddSingleton<IEmbeddingService, EmbeddingService>();
builder.Services.AddScoped<IEncryptionService,EncryptionService>();
builder.Services.AddHttpClient();
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins("http://localhost:3000")
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});



builder.Services.AddSingleton<IConnectionMultiplexer>(
    ConnectionMultiplexer.Connect("redis:6379")
    );

builder.Services.AddSingleton<IAmazonS3>(options =>
{

    return new AmazonS3Client(
        Environment.GetEnvironmentVariable("S3_KEY_ID"),
        Environment.GetEnvironmentVariable("S3_KEY_SECRET"),
        new AmazonS3Config
        {
            ServiceURL = Environment.GetEnvironmentVariable("S3_ENDPOINT"),
            ForcePathStyle = true,
            AuthenticationRegion = "garage",
            UseHttp = true,
           
        }
    );
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
app.UseMiddleware<ExceptionHandlerMiddleware>();
app.UseHttpsRedirection();
app.UseAuthentication();
app.UseAuthorization();
app.UseCors("AllowFrontend");
app.MapHub<ChatHub>("/hubs/chat");
app.MapHub<VideoVoiceHub>("/hubs/media");
app.MapControllers();


using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<VoxlockDbContext>();
    db.Database.Migrate();

    await backend.Seeders.PermissionSeeder.SeedAsync(db);
}
app.Run();
