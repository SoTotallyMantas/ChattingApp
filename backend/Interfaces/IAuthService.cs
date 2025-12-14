using backend.DTO.AuthDtos;
using backend.Models;

namespace backend.Interfaces
{
    public interface IAuthService
    {
        Task<AuthResponseDto> Register(RegisterRequestDto dto);
        Task<AuthResponseDto> Login(LoginRequestDto dto);
        Task<AuthResponseDto> RefreshToken(string refreshToken);
        Task RevokeRefreshToken(string refreshToken, Guid userGuid);
        Task<Users?> ValidateRefreshToken(string token);
        Task<AuthResponseDto> IssueTokens(Users user);
        Task ChangePassword(Guid userGuid, string currentPassword, string newPassword);

    }
}
