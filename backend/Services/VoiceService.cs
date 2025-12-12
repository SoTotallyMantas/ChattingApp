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
        private readonly ILogger<VoiceService> _log;
        private readonly HttpClient _http;

        public VoiceService(VoxlockDbContext db, ILogger<VoiceService> log)
        {
            _db = db;
            _log = log;
              var baseUrl = Environment.GetEnvironmentVariable("JANUS_REST_URL") ?? "http://janus:8088/janus";
            _http = new HttpClient { BaseAddress = new Uri(baseUrl) };
        }

        public async Task<int> GetOrCreateJanusRoomIdAsync(Guid channelGuid)
        {
            var entry = await _db.VoiceChannels.FirstOrDefaultAsync(v => v.ChannelGuid == channelGuid);
            if (entry != null) return entry.CurrentJanusRoomId;

            int roomId = Math.Abs(channelGuid.GetHashCode());

            entry = new VoiceChannels
            {
                ChannelGuid = channelGuid,
                CurrentJanusRoomId = roomId,
                LastActiveAt = DateTime.UtcNow
            };

            _db.VoiceChannels.Add(entry);
            await _db.SaveChangesAsync();

            await EnsureVideoroomExistsAsync(roomId);
            return roomId;
        }

        private async Task EnsureVideoroomExistsAsync(int roomId) 
        {
            try {
                
                var tx1 = Guid.NewGuid().ToString("N");
                var session = await _http.PostAsJsonAsync("", new { janus = "create", transaction = tx1});
                var sessionId = JsonDocument.Parse(await session.Content.ReadAsStringAsync()).RootElement.GetProperty("data").GetProperty("id").GetInt64();

                
                var tx2 = Guid.NewGuid().ToString("N");
                var attach = await _http.PostAsJsonAsync($"/{sessionId}", new { janus = "attach", plugin = "janus.plugin.videoroom", transaction = tx2});
                var handleId = JsonDocument.Parse(await attach.Content.ReadAsStringAsync()).RootElement.GetProperty("data").GetProperty("id").GetInt64();

                
                var tx3 = Guid.NewGuid().ToString("N");
                var body = new { request = "create", room = roomId, publishers = 100, bitrate = 256000, bitrate_cap = true, audiolevel_ext = true, videoorient_ext = true };
                var create = await _http.PostAsJsonAsync($"/{sessionId}/{handleId}", new { janus = "message", body, transaction = tx3});
                var doc = JsonDocument.Parse(await create.Content.ReadAsStringAsync());
                if (doc.RootElement.TryGetProperty("error", out var err) && err.GetProperty("code").GetInt32() != 427) {
                    _log.LogWarning("Janus room create failed for {RoomId}: {Code} {Reason}", roomId, err.GetProperty("code").GetInt32(), err.GetProperty("reason").GetString());
                }
            } catch (Exception ex) {
                _log.LogWarning(ex, "Failed to ensure Janus videoroom {RoomId}", roomId);
            }
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
    }
}
using backend.Context;
using backend.Interfaces;
using backend.Models;
using Microsoft.EntityFrameworkCore;
using System.Net.Http.Json;
using System.Text.Json;

namespace backend.Services
{
    public class VoiceService : IVoiceService
    {
        private readonly VoxlockDbContext _db;
        private readonly ILogger<VoiceService> _log;
        private readonly HttpClient _http;
        private readonly string? _janusSecret;

        public VoiceService(VoxlockDbContext db, ILogger<VoiceService> log)
        {
            _db = db;
            _log = log;
            var baseUrl = Environment.GetEnvironmentVariable("JANUS_REST_URL") ?? "http://janus:8088/janus";
            _janusSecret = Environment.GetEnvironmentVariable("JANUS_ADMIN_SECRET");
            _http = new HttpClient { BaseAddress = new Uri(baseUrl) };
        }

        public async Task<int> GetOrCreateJanusRoomIdAsync(Guid channelGuid)
        {
            var entry = await _db.VoiceChannels.FirstOrDefaultAsync(v => v.ChannelGuid == channelGuid);
            if (entry != null) return entry.CurrentJanusRoomId;

            int roomId = Math.Abs(channelGuid.GetHashCode());

            entry = new VoiceChannels
            {
                ChannelGuid = channelGuid,
                CurrentJanusRoomId = roomId,
                LastActiveAt = DateTime.UtcNow
            };

            _db.VoiceChannels.Add(entry);
            await _db.SaveChangesAsync();

            // Create the Janus videoroom once when the channel is first seen
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
                // 1) Create session
                var tx1 = Guid.NewGuid().ToString("N");
                var sessionResp = await _http.PostAsJsonAsync("", new { janus = "create", transaction = tx1, apisecret = _janusSecret });
                var sessionJson = JsonDocument.Parse(await sessionResp.Content.ReadAsStringAsync());
                var sessionId = sessionJson.RootElement.GetProperty("data").GetProperty("id").GetInt64();

                // 2) Attach videoroom plugin
                var tx2 = Guid.NewGuid().ToString("N");
                var attachResp = await _http.PostAsJsonAsync($"/{sessionId}", new { janus = "attach", plugin = "janus.plugin.videoroom", transaction = tx2, apisecret = _janusSecret });
                var attachJson = JsonDocument.Parse(await attachResp.Content.ReadAsStringAsync());
                var handleId = attachJson.RootElement.GetProperty("data").GetProperty("id").GetInt64();

                // 3) Create room (ignore if it already exists)
                var tx3 = Guid.NewGuid().ToString("N");
                var body = new
                {
                    request = "create",
                    room = roomId,
                    publishers = 100,
                    audiolevel_ext = true,
                    videoorient_ext = true,
                    bitrate = 256000,
                    bitrate_cap = true
                };
                var createResp = await _http.PostAsJsonAsync($"/{sessionId}/{handleId}", new { janus = "message", body, transaction = tx3, apisecret = _janusSecret });
                var createJson = JsonDocument.Parse(await createResp.Content.ReadAsStringAsync());
                if (createJson.RootElement.TryGetProperty("error", out var err))
                {
                    var code = err.GetProperty("code").GetInt32();
                    if (code != 427) // 427 = room already exists
                    {
                        _log.LogWarning("Janus videoroom create failed for {RoomId}: {Code} {Reason}", roomId, code, err.GetProperty("reason").GetString());
                    }
                }
            }
            catch (Exception ex)
            {
                _log.LogWarning(ex, "Failed to ensure Janus videoroom {RoomId}", roomId);
            }
        }
    }
}
