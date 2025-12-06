using backend.Models;

namespace backend.Interfaces
{
    public interface ITokenService
    {
        string GenerateAccessToken(Users user);
        string GenerateRefreshToken();
    }
}
