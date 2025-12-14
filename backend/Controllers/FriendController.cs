using System.Collections.Generic;
using backend.DTO.FriendDtos;
using backend.Extensions;
using backend.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers
{
    [ApiController]
    [Authorize]
    [Route("api/friends")]
    public class FriendController(IFriendService friends) : ControllerBase
    {
        private readonly IFriendService _friends = friends;

        [HttpGet]
        public async Task<ActionResult<List<FriendResponseDto>>> GetMyFriends()
        {
            var userGuid = User.GetUserGuid();
            var result = await _friends.GetFriendsAsync(userGuid);
            return Ok(result);
        }

        [HttpPost]
        public async Task<ActionResult<FriendResponseDto>> AddFriend([FromBody] CreateFriendRequestDto dto)
        {
            var userGuid = User.GetUserGuid();
            var result = await _friends.AddFriendAsync(userGuid, dto.FriendGuid);
            return Ok(result);
        }
    }
}
