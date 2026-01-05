using backend.Context;
using backend.DTO.SettingsDtos;
using backend.DTO.UserDtos;
using backend.Helper;
using backend.Interfaces;
using backend.Models;
using Microsoft.EntityFrameworkCore;
using System.Globalization;

namespace backend.Services
{
    public class UserService(VoxlockDbContext db, IEncryptionService encryptionService, IS3StorageService storageService) : IUserService
    {
        private readonly VoxlockDbContext _db = db;
        private readonly IEncryptionService _encryptionService = encryptionService;
        private readonly IS3StorageService _storageService = storageService;

        public async Task<UserProfileDto?> GetBasicProfileAsync(Guid userGuid)
        {
            var user = await _db.Users
                .AsNoTracking()
                .Where(u => u.UserGuid == userGuid)
                .Select(u => new UserProfileDto
                {
                    DisplayName = u.DisplayName,
                    AvatarKey = u.AvatarKey
                })
                .FirstOrDefaultAsync();

            return user;
        }
        public async Task<List<Guid>> GetServersForUserAsync(Guid userGuid)
        {
            return await _db.ServerMembers
                .Where(sm => sm.UserGuid == userGuid)
                .Select(sm => sm.ServerGuid)
                .ToListAsync();
            
        }

        public async Task<bool> IsServerMemberAsync(Guid userGuid, Guid serverGuid)
        {
            return await _db.ServerMembers
                .AnyAsync(sm =>
                sm.UserGuid == userGuid &&
                sm.ServerGuid == serverGuid
            );
        }

        public async Task<bool> IsChannelMember(Guid userGuid, Guid channelGuid)
        {
            var serverGuid = await _db.Channels
                .Where(c => c.ChannelGuid == channelGuid)
                .Select(c => c.ServerGuid)
                .FirstOrDefaultAsync();
            if (serverGuid == Guid.Empty)
            {
                return false; 
            }
            return await IsServerMemberAsync(userGuid, serverGuid);
        }

        public async Task<bool> HasChannelPermission(Guid userGuid, Guid channelGuid, string permission)
        {
            var serverGuid = await _db.Channels
                .Where(c => c.ChannelGuid == channelGuid)
                .Select(c => c.ServerGuid)
                .FirstOrDefaultAsync();

            if (serverGuid == Guid.Empty)
            {
                return false; 
            }

            var userRoles = await _db.ServerUserRoles
                .Where(sm => sm.UserGuid == userGuid && sm.ServerGuid == serverGuid)
                .Select(sm => sm.RoleGuid)
                .ToListAsync();

            if(userRoles.Count == 0)
            {
                return false;
            }

            return await _db.ServerRolePermissions
                .Where(rp => userRoles.Contains(rp.RoleGuid))
                .AnyAsync(rp => rp.Permission.Name == permission);
        }

        public async Task<UserSettingsResponseDto?> GetUserSettingsAsync(Guid userGuid)
        {
            var user = await _db.Users
                .Include(u => u.Settings)
                .AsNoTracking()
                .FirstOrDefaultAsync(u => u.UserGuid == userGuid);

            if (user == null) return null;

            var settings = user.Settings;

            return new UserSettingsResponseDto
            {
                Theme = settings?.Theme ?? "light",
                MuteNotifications = settings?.MuteNotifications ?? false,
                DisplayName = user.DisplayName
            };
        }

        public async Task<UserSettingsResponseDto> UpdateUserSettingsAsync(Guid userGuid, UpdateUserSettingsRequestDto dto)
        {
            var user = await _db.Users
                .Include(u => u.Settings)
                .FirstOrDefaultAsync(u => u.UserGuid == userGuid);

            if (user == null)
                throw new InvalidOperationException("Could not find user");

            var settings = user.Settings;

            if (settings == null)
            {
                settings = new UserSettings
                {
                    UserSettingsGuid = Guid.NewGuid(),
                    UserGuid = userGuid,
                    Theme = dto.Theme ?? "light",
                    MuteNotifications = dto.MuteNotifications
                };
                _db.UserSettings.Add(settings);
            }
            else
            {
                settings.Theme = dto.Theme ?? settings.Theme;
                settings.MuteNotifications = dto.MuteNotifications;
            }

            if (!string.IsNullOrWhiteSpace(dto.DisplayName))
            {
                user.DisplayName = dto.DisplayName.Trim();
            }

            await _db.SaveChangesAsync();

            return new UserSettingsResponseDto
            {
                Theme = settings.Theme,
                MuteNotifications = settings.MuteNotifications,
                DisplayName = user.DisplayName
            };
        }

        public async Task SetUserPresenceStatusAsync(Guid userGuid, string? presence)
        {
            var user = await  _db.Users.FirstOrDefaultAsync(u => u.UserGuid == userGuid);
            if (user == null)
            {
                throw new InvalidOperationException("Could not find user");
            }
            user.Status = presence;
            await _db.SaveChangesAsync();
        }

        public async Task<List<UserResponseDto>> SearchUsersAsync(Guid userGuid, string query, int limit = 20)
        {
            var trimmed = query?.Trim() ?? string.Empty;
            if (string.IsNullOrWhiteSpace(trimmed))
            {
                return [];
            }

            var safeLimit = Math.Clamp(limit, 1, 50);
            var lowered = trimmed.ToLower(CultureInfo.InvariantCulture);

            return await _db.Users
                .AsNoTracking()
                .Where(u => !u.IsDeleted && u.UserGuid != userGuid)
                .Where(u =>
                    u.UserName.ToLower().Contains(lowered) ||
                    u.DisplayName.ToLower().Contains(lowered))
                .OrderBy(u => u.UserName)
                .Take(safeLimit)
                .Select(u => new UserResponseDto
                {
                    UserGuid = u.UserGuid,
                    DisplayName = u.DisplayName,
                    UserName = u.UserName,
                    AvatarKey = u.AvatarKey,
                    Presence = u.Status
                })
                .ToListAsync();
        }
        public async Task<string> UploadAvatarAsync(Guid userGuid, Stream fileStream, string contentType, CancellationToken ct)
        {
            var user = await _db.Users.FirstOrDefaultAsync(u => u.UserGuid == userGuid, ct);

            if (user == null)
            {
                throw new InvalidOperationException("Could not find user");

            }
            var newKey = StorageKeyGenerator.UserAvatar(userGuid);
            var oldKey = user.AvatarKey;

            await _storageService.UploadAsync(newKey, fileStream, contentType, ct);

            if (!string.IsNullOrEmpty(oldKey) && oldKey != newKey)
            {
                try 
                {
                     await _storageService.DeleteAsync(oldKey, ct);     
                } 
                catch
                {
                    
                }
            }

            user.AvatarKey = newKey;

            await _db.SaveChangesAsync(ct);
            return newKey;
        }
        public async Task<(Stream stream, string contentType)?> GetAvatarAsync(Guid userGuid, CancellationToken ct)
        {
            var user = await _db.Users
                .AsNoTracking()
                .FirstOrDefaultAsync(u => u.UserGuid == userGuid, ct);

            if(user?.AvatarKey == null)
            {
                return null;
            }

            return await _storageService.DownloadAsync(user.AvatarKey, ct);
        }
    }
}
