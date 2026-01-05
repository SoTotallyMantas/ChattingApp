using System.Text.Json;
using backend.Context;
using backend.Interfaces;
using backend.Models;
using Microsoft.EntityFrameworkCore;


namespace backend.Services
{
    public class VoiceService : IVoiceService
    {
        private readonly VoxlockDbContext _db;
        private readonly HttpClient _http;
        private readonly string? _janusSecret;

        public VoiceService(VoxlockDbContext db)
        {
            _db = db;
            var baseUrl = Environment.GetEnvironmentVariable("JANUS_REST_URL") ?? "http://janus:8088/janus/";
            if (!baseUrl.EndsWith("/"))
            {
                baseUrl += "/";
            }
            _janusSecret = Environment.GetEnvironmentVariable("JANUS_ADMIN_SECRET");
            _http = new HttpClient { BaseAddress = new Uri(baseUrl) };
        }

    public async Task<int> GetOrCreateJanusRoomIdAsync(Guid channelGuid)
{
        var entry = await _db.VoiceChannels.FirstOrDefaultAsync(v => v.ChannelGuid == channelGuid);
        int roomId;

        if (entry != null)
        {
            roomId = entry.CurrentJanusRoomId;
        }
        else
        {
            roomId = Math.Abs(channelGuid.GetHashCode());
            entry = new VoiceChannels
            {
                ChannelGuid = channelGuid,
                CurrentJanusRoomId = roomId,
                LastActiveAt = DateTime.UtcNow
            };

            _db.VoiceChannels.Add(entry);
            await _db.SaveChangesAsync();
        }

        
        
        await EnsureVideoroomExistsAsync(roomId);
        

        return roomId;
    }

        public async Task<Guid?> GetUserChannelAsync(Guid userGuid)
        {
            return await _db.VoiceStates
                .Where(v => v.UserGuid == userGuid)
                .Select(v => (Guid?)v.ChannelGuid)
                .FirstOrDefaultAsync();
        }

        public async Task JoinVoiceAsync(Guid channelGuid, Guid userGuid)
        {
            var state = await _db.VoiceStates
                .FirstOrDefaultAsync(v => v.ChannelGuid == channelGuid && v.UserGuid == userGuid);

            if (state == null)
            {
                state = new VoiceStates
                {
                    UserGuid = userGuid,
                    ChannelGuid = channelGuid,
                    JoinedAt = DateTime.UtcNow,
                    IsMuted = false,
                    IsDeafened = false
                };
                _db.VoiceStates.Add(state);
            }

            await _db.SaveChangesAsync();
        }

        public async Task LeaveVoiceAsync(Guid channelGuid, Guid userGuid)
        {
            var state = await _db.VoiceStates
                .FirstOrDefaultAsync(v => v.ChannelGuid == channelGuid && v.UserGuid == userGuid);

            if (state != null)
            {
                _db.VoiceStates.Remove(state);
                await _db.SaveChangesAsync();
            }
        }

        public async Task UpdateMuteStateAsync(Guid channelGuid, Guid userGuid, bool isMuted)
        {
            var state = await _db.VoiceStates.FirstAsync(v => v.ChannelGuid == channelGuid && v.UserGuid == userGuid);
            state.IsMuted = isMuted;
            await _db.SaveChangesAsync();
        }

        public async Task UpdateDeafenStateAsync(Guid channelGuid, Guid userGuid, bool isDeafened)
        {
            var state = await _db.VoiceStates.FirstAsync(v => v.ChannelGuid == channelGuid && v.UserGuid == userGuid);
            state.IsDeafened = isDeafened;
            await _db.SaveChangesAsync();
        }

        public async Task<List<VoiceStates>> GetVoiceStatesAsync(Guid channelGuid)
        {
            return await _db.VoiceStates
                .Where(v => v.ChannelGuid == channelGuid)
                .ToListAsync();
        }

        private async Task EnsureVideoroomExistsAsync(int roomId)
        {
            try
            {
                
                var tx1 = Guid.NewGuid().ToString("N");
                var sessionResp = await _http.PostAsJsonAsync("", new { janus = "create", transaction = tx1 });

                if (!sessionResp.IsSuccessStatusCode)
                {
                    Console.WriteLine($"Failed to create session for videoroom: {sessionResp.StatusCode} {sessionResp.ReasonPhrase}");
                    return;
                }

                var sessionJson = JsonDocument.Parse(await sessionResp.Content.ReadAsStringAsync());
                if (!sessionJson.RootElement.TryGetProperty("data", out var sessionData))
                {
                    Console.WriteLine("Failed to get session ID from response.");
                    return;
                }

                var sessionId = sessionData.GetProperty("id").GetInt64();

                
                var tx2 = Guid.NewGuid().ToString("N");
                var attachResp = await _http.PostAsJsonAsync($"{sessionId}", new { janus = "attach", plugin = "janus.plugin.videoroom", transaction = tx2 });

                if (!attachResp.IsSuccessStatusCode)
                {
                    Console.WriteLine($"Failed to attach videoroom plugin: {attachResp.StatusCode} {attachResp.ReasonPhrase}");
                    return;
                }

                var attachJson = JsonDocument.Parse(await attachResp.Content.ReadAsStringAsync());
                if (!attachJson.RootElement.TryGetProperty("data", out var attachData))
                {
                    Console.WriteLine("Failed to get handle ID from response.");
                    return;
                }

                var handleId = attachData.GetProperty("id").GetInt64();

                var tx3 = Guid.NewGuid().ToString("N");
                var body = new
                {
                    request = "create",
                    room = roomId,
                    publishers = 100,
                    audiolevel_ext = true,
                    videoorient_ext = true,
                    bitrate = 2540000,
                    bitrate_cap = true
                };

                var createResp = await _http.PostAsJsonAsync($"{sessionId}/{handleId}", new { janus = "message", body, transaction = tx3 });

                if (!createResp.IsSuccessStatusCode)
                {
                    Console.WriteLine($"Failed to create room for videoroom {roomId}: {createResp.StatusCode} {createResp.ReasonPhrase}");
                    return;
                }

                var createJson = JsonDocument.Parse(await createResp.Content.ReadAsStringAsync());

                if (createJson.RootElement.TryGetProperty("error", out var err))
                {
                    var code = err.GetProperty("code").GetInt32();
                    if (code != 427) 
                    {
                        Console.WriteLine($"Janus videoroom create failed for {roomId}: {code} {err.GetProperty("reason").GetString()}");
                    }
                }
                else
                {
                    Console.WriteLine($"Successfully ensured videoroom {roomId} exists.");
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Failed to ensure Janus videoroom {roomId}: {ex}");
            }
        }


    }
}
