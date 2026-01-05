using backend.Context;
using backend.DTO.AuthDtos;
using backend.Interfaces;
using backend.Models;
using Microsoft.EntityFrameworkCore;
using System.Linq;
using System.Security.Cryptography;
using System.Text;

namespace backend.Services
{
    public class AuthService : IAuthService
    {
        private readonly VoxlockDbContext _db;
        private readonly ITokenService _tokenService;

        public AuthService(VoxlockDbContext db, ITokenService tokenService)
        {
            _db = db;
            _tokenService = tokenService;
        }

        public async Task ChangePassword(Guid userGuid, string currentPassword, string newPassword)
        {
            var user = await _db.Users.FirstOrDefaultAsync(u => u.UserGuid == userGuid);
            if (user == null)
            {
                throw new UnauthorizedAccessException("User not found.");
            }

            if (!VerifyPassword(currentPassword, user.PasswordHash, user.PasswordSalt))
            {
                throw new UnauthorizedAccessException("Invalid current password.");
            }

            var (hash, salt) = HashPassword(newPassword);
            user.PasswordHash = hash;
            user.PasswordSalt = salt;

            var tokens = await _db.RefreshTokens
                .Where(t => t.UserGuid == userGuid && !t.IsRevoked)
                .ToListAsync();

            foreach (var token in tokens)
            {
                token.IsRevoked = true;
                token.RevokedAt = DateTime.UtcNow;
            }

            await _db.SaveChangesAsync();
        }

        public async Task<AuthResponseDto> Login(LoginRequestDto dto)
        {
            var email = dto.Email?.Trim().ToLowerInvariant();
            var user = await _db.Users.FirstOrDefaultAsync(u => u.Email == email || u.UserName == dto.UserName);
            if (user == null)
            {
                throw new UnauthorizedAccessException("Invalid credentials.");
            }
            if (user.IsDeleted)
            {
                throw new UnauthorizedAccessException("Account deleted.");
            }
            if(!VerifyPassword(dto.Password, user.PasswordHash, user.PasswordSalt))
            {
                throw new UnauthorizedAccessException("Invalid credentials.");
            }
            return await IssueTokens(user);

        }

        public async Task<Users?> ValidateRefreshToken(string token)
        {
            var row = await _db.RefreshTokens
                .Include(t => t.User)
                .FirstOrDefaultAsync(t =>
                    t.Token == token &&
                    !t.IsRevoked &&
                    t.ExpiresAt > DateTime.UtcNow);

            if (row?.User?.IsDeleted == true)
            {
                return null;
            }

            return row?.User;
        }

        public async Task RevokeRefreshToken(string refreshToken, Guid userGuid)
        {
            var token = await _db.RefreshTokens
            .FirstOrDefaultAsync(t =>
                t.Token == refreshToken &&
                t.UserGuid == userGuid &&
                !t.IsRevoked);

            if (token == null)
                return;

            token.IsRevoked = true;
            await _db.SaveChangesAsync();
        }
        public async Task<AuthResponseDto> Register(RegisterRequestDto dto)
        {
            var email = dto.Email.Trim().ToLowerInvariant();
            var userName = dto.UserName.Trim();
            var displayName = dto.DisplayName.Trim();

            if(await _db.Users.AnyAsync(u => u.Email == email || u.UserName == userName))
            {
                throw new InvalidOperationException("User with the same email or username already exists.");
            }

            var whitelistExists = await _db.RegistrationWhitelist.AnyAsync();
            var whitelisted = await _db.RegistrationWhitelist.AnyAsync(w => w.Email == email);

            if (whitelistExists && !whitelisted)
            {
                throw new UnauthorizedAccessException("Registration is restricted. Your email is not whitelisted.");
            }

            bool makeSystemAdmin = !await _db.Users.AnyAsync(u => u.IsSystemAdmin);

            var (hash, salt) = HashPassword(dto.Password);
            Guid userGuid = Guid.NewGuid();
            var user = new Users
            {
                UserGuid = userGuid,
                DisplayName = displayName,
                UserName = userName,
                Email = email,
                PasswordHash = hash,
                PasswordSalt = salt,
                AvatarKey = null,
                IsDeleted = false,
                IsSystemAdmin = makeSystemAdmin,
                CreatedAt = DateTime.UtcNow,
                Settings = new UserSettings
                {
                    UserSettingsGuid = Guid.NewGuid(),
                    UserGuid = userGuid,
                    Theme = "light",
                    MuteNotifications = false

                },
            };

            _db.Users.Add(user);
            await _db.SaveChangesAsync();

            return await IssueTokens(user);
        }

        public async Task<AuthResponseDto> RefreshToken(string refreshTokenOuter)
        {
            var refreshToken = await _db.RefreshTokens
                .Include(rt => rt.User)
                .FirstOrDefaultAsync(r => r.Token == refreshTokenOuter && !r.IsRevoked && r.ExpiresAt > DateTime.UtcNow);

            if (refreshToken == null)
            {
                               throw new UnauthorizedAccessException("Invalid refresh token.");
            }
            if(refreshToken.ExpiresAt <= DateTime.UtcNow)
            {
                throw new UnauthorizedAccessException("Refresh token has expired.");
            }
            refreshToken.IsRevoked = true;
            await _db.SaveChangesAsync();

            return await IssueTokens(refreshToken.User);
        }

        public async Task<AuthResponseDto> IssueTokens(Users user)
        {
            var accessToken = _tokenService.GenerateAccessToken(user);
            var refreshToken = _tokenService.GenerateRefreshToken();

            var RefreshToken = new UserTokens
            {
                TokenGuid = Guid.NewGuid(),
                UserGuid = user.UserGuid,
                Token = refreshToken,
                ExpiresAt = DateTime.UtcNow.AddDays(7),
                IsRevoked = false
            };

            _db.RefreshTokens.Add(RefreshToken);
            await _db.SaveChangesAsync();

            return new AuthResponseDto
            {
                UserGuid = user.UserGuid,
                DisplayName = user.DisplayName,
                AvatarKey = user.AvatarKey,
                Token = accessToken,
                RefreshToken = refreshToken
            };
        }
        private static (string Hash, string Salt) HashPassword(string password)
        {
            var saltBytes = new byte[16];
            using var rng = RandomNumberGenerator.Create();
            rng.GetBytes(saltBytes);

            var salt = Convert.ToBase64String(saltBytes);
            var hash = Convert.ToBase64String(SHA256.HashData(Encoding.UTF8.GetBytes(password + salt)));

            return (hash, salt);
        }

        private static bool VerifyPassword(string password, string storedHash, string storedSalt)
        {
            var hash = Convert.ToBase64String(SHA256.HashData(Encoding.UTF8.GetBytes(password + storedSalt)));
            return hash == storedHash;
        }

        public async Task DeleteAccount(Guid userGuid, string password)
        {
            var user = await _db.Users.FirstOrDefaultAsync(u => u.UserGuid == userGuid);
            if (user == null)
            {
                throw new UnauthorizedAccessException("User not found.");
            }
            if (user.IsDeleted)
            {
                throw new InvalidOperationException("Account already deleted.");
            }
            if (!VerifyPassword(password, user.PasswordHash, user.PasswordSalt))
            {
                throw new UnauthorizedAccessException("Invalid password.");
            }

            var tokens = await _db.RefreshTokens
                .Where(t => t.UserGuid == userGuid && !t.IsRevoked)
                .ToListAsync();
            foreach (var token in tokens)
            {
                token.IsRevoked = true;
                token.RevokedAt = DateTime.UtcNow;
            }

            var voiceStates = _db.VoiceStates.Where(v => v.UserGuid == userGuid);
            _db.VoiceStates.RemoveRange(voiceStates);

            var friendships = _db.Friendships
                .Where(f => f.RequesterGuid == userGuid || f.AddresseeGuid == userGuid);
            _db.Friendships.RemoveRange(friendships);

            var servers = await _db.Servers
                .Where(s => s.Members.Any(m => m.UserGuid == userGuid))
                .ToListAsync();

            foreach (var server in servers)
            {
                var isOwner = server.OwnerGuid == userGuid;

                var roles = _db.ServerUserRoles
                    .Where(r => r.ServerGuid == server.ServerGuid && r.UserGuid == userGuid);
                _db.ServerUserRoles.RemoveRange(roles);

                var membership = await _db.ServerMembers
                    .FirstOrDefaultAsync(m => m.ServerGuid == server.ServerGuid && m.UserGuid == userGuid);
                if (membership != null)
                {
                    _db.ServerMembers.Remove(membership);
                }

                if (!isOwner)
                {
                    continue;
                }

                var candidate = await _db.ServerUserRoles
                    .Where(ur => ur.ServerGuid == server.ServerGuid && ur.UserGuid != userGuid)
                    .Select(ur => new
                    {
                        ur.UserGuid,
                        Position = ur.Role.IsDefault ? int.MaxValue : ur.Role.Position
                    })
                    .GroupBy(x => x.UserGuid)
                    .Select(g => new { UserGuid = g.Key, Position = g.Min(x => x.Position) })
                    .OrderBy(x => x.Position)
                    .FirstOrDefaultAsync();

                var newOwnerGuid = candidate?.UserGuid ?? await _db.ServerMembers
                    .Where(m => m.ServerGuid == server.ServerGuid && m.UserGuid != userGuid)
                    .Select(m => m.UserGuid)
                    .FirstOrDefaultAsync();

                if (newOwnerGuid == Guid.Empty)
                {
                    _db.Servers.Remove(server);
                    continue;
                }

                server.OwnerGuid = newOwnerGuid;

                var ownerRoleGuid = await _db.ServerRoles
                    .Where(r => r.ServerGuid == server.ServerGuid && !r.IsDefault && r.RoleName.ToLower() == "owner")
                    .Select(r => r.RoleGuid)
                    .FirstOrDefaultAsync();

                if (ownerRoleGuid != Guid.Empty)
                {
                    bool hasOwnerRole = await _db.ServerUserRoles.AnyAsync(ur =>
                        ur.ServerGuid == server.ServerGuid &&
                        ur.UserGuid == newOwnerGuid &&
                        ur.RoleGuid == ownerRoleGuid);
                    if (!hasOwnerRole)
                    {
                        _db.ServerUserRoles.Add(new ServerUserRoles
                        {
                            ServerGuid = server.ServerGuid,
                            UserGuid = newOwnerGuid,
                            RoleGuid = ownerRoleGuid,
                            AddedAt = DateTime.UtcNow
                        });
                    }
                }
            }

            user.IsDeleted = true;
            user.DeletedAt = DateTime.UtcNow;
            user.Status = "offline";
            user.DisplayName = "Deleted user";
            user.UserName = $"deleted-{user.UserGuid:N}";
            user.Email = $"deleted-{user.UserGuid:N}@example.invalid";
            user.AvatarKey = null;
            var (hash, salt) = HashPassword(Guid.NewGuid().ToString("N"));
            user.PasswordHash = hash;
            user.PasswordSalt = salt;

            await _db.SaveChangesAsync();
        }
    }
}
