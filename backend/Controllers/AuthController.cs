using backend.DTO.AuthDtos;
using backend.Extensions;
using backend.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/auth")]
    public class AuthController(IAuthService auth) : ControllerBase
    {
        private readonly IAuthService _auth = auth;

        private void WriteRefreshCookies(string refreshToken)
        {
            Response.Cookies.Append("refreshToken", refreshToken, new CookieOptions
            {
                HttpOnly = true,
                Secure = false, // True when https
                SameSite = SameSiteMode.Strict,
                Expires = DateTime.UtcNow.AddDays(7)
            });
        
        }

        [HttpPost("register")]
        public async Task<ActionResult<AuthResponseDto>> Register([FromBody] RegisterRequestDto dto)
        {
           var result = await _auth.Register(dto);
            WriteRefreshCookies(result.RefreshToken!);
            result.RefreshToken = null;
            return Ok(result);
        }

    
        [HttpPost("login")]
        public async Task<ActionResult<AuthResponseDto>> Login([FromBody] LoginRequestDto dto)
        {
            var result = await _auth.Login(dto);
            WriteRefreshCookies(result.RefreshToken!);
            result.RefreshToken = null;
            return Ok(result);
        }

        [HttpPost("refresh")]
        public async Task<ActionResult<AuthResponseDto>> Refresh([FromBody] RefreshTokenRequestDto dto)
        {
            Guid userGuid = User.GetUserGuid();
            var cookie = Request.Cookies["refreshToken"];
            if(cookie == null)
            {
                return Unauthorized("Missing refresh token.");
            }
            var user = await _auth.ValidateRefreshToken(cookie);
            if(user == null)
            {
                return Unauthorized("Invalid refresh token.");
            }

            await _auth.RevokeRefreshToken(cookie, userGuid);
            var newTokens = await _auth.IssueTokens(user);

            if(newTokens.RefreshToken == null)
            {
                return Unauthorized("Could not issue new refresh token.");
            }

            WriteRefreshCookies(newTokens.RefreshToken);

            return Ok(newTokens);
        }

       
        [Authorize]
        [HttpPost("logout")]
        public async Task<IActionResult> Logout([FromBody] RefreshTokenRequestDto dto)
        {
            Guid userGuid = User.GetUserGuid();
            var cookie = Request.Cookies["refreshToken"];
            if(cookie != null)
            {
                await _auth.RevokeRefreshToken(cookie, userGuid);
            }

            Response.Cookies.Delete("refreshToken");

            return Ok();
        }

    }
}
