using backend.Context;
using backend.DTO.AuthDtos;
using backend.Interfaces;
using backend.Models;
using Microsoft.EntityFrameworkCore;
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

        public async Task<AuthResponseDto> Login(LoginRequestDto dto)
        {
            var user = await _db.Users.FirstOrDefaultAsync(u => u.Email == dto.Email || u.UserName == dto.UserName);
            if (user == null)
            {
                throw new UnauthorizedAccessException("Invalid credentials.");
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
            if(await _db.Users.AnyAsync(u => u.Email == dto.Email || u.UserName == dto.UserName))
            {
                throw new InvalidOperationException("User with the same email or username already exists.");
            }
            var (hash, salt) = HashPassword(dto.Password);
            Guid userGuid = Guid.NewGuid();
            var user = new Users
            {
                UserGuid = userGuid,
                DisplayName = dto.DisplayName,
                UserName = dto.UserName,
                Email = dto.Email,
                PasswordHash = hash,
                PasswordSalt = salt,
                AvatarURL = null,
                IsDeleted = false,
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
                AvatarUrl = user.AvatarURL,
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
    }
}
