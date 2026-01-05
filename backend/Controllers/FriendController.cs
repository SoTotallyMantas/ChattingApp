using System.Collections.Generic;
using System.Linq;
using backend.DTO.FriendDtos;
using backend.Extensions;
using backend.Hubs;
using backend.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;

namespace backend.Controllers
{
    [ApiController]
    [Authorize]
    [Route("api/friends")]
    public class FriendController(IFriendService friends, IHubContext<ChatHub> hub) : ControllerBase
    {
        private readonly IFriendService _friends = friends;
        private readonly IHubContext<ChatHub> _hub = hub;

        private Task NotifyFriendsAsync(params Guid[] userGuids)
        {
            var tasks = userGuids
                .Where(g => g != Guid.Empty)
                .Select(g => _hub.Clients.User(g.ToString()).SendAsync("FriendsUpdated"));
            return Task.WhenAll(tasks);
        }

        [HttpGet]
        public async Task<ActionResult<List<FriendResponseDto>>> GetMyFriends()
        {
            var userGuid = User.GetUserGuid();
            var result = await _friends.GetFriendsAsync(userGuid);
            return Ok(result);
        }

        [HttpGet("blocked")]
        public async Task<ActionResult<List<FriendResponseDto>>> GetBlocked()
        {
            var userGuid = User.GetUserGuid();
            var result = await _friends.GetBlockedAsync(userGuid);
            return Ok(result);
        }
        [HttpPost("{friendshipGuid:guid}/unblock")]
        public async Task<IActionResult> Unblock(Guid friendshipGuid)
        {
            var userGuid = User.GetUserGuid();
            var (requesterGuid, addresseeGuid) = await _friends.GetFriendshipUsersAsync(friendshipGuid);
            await _friends.UnblockFriendAsync(userGuid, friendshipGuid);
            await NotifyFriendsAsync(requesterGuid, addresseeGuid);
            return NoContent();
        }
        [HttpGet("incoming")]
        public async Task<ActionResult<List<FriendResponseDto>>> GetIncoming()
        {
            var userGuid = User.GetUserGuid();
            var result = await _friends.GetIncomingRequestsAsync(userGuid);
            return Ok(result);
        }

        [HttpGet("outgoing")]
        public async Task<ActionResult<List<FriendResponseDto>>> GetOutgoing()
        {
            var userGuid = User.GetUserGuid();
            var result = await _friends.GetOutgoingRequestsAsync(userGuid);
            return Ok(result);
        }

        [HttpPost]
        public async Task<ActionResult<FriendResponseDto>> AddFriend([FromBody] CreateFriendRequestDto dto)
        {
            var userGuid = User.GetUserGuid();
            var result = await _friends.AddFriendAsync(userGuid, dto.FriendGuid);
            await NotifyFriendsAsync(userGuid, dto.FriendGuid);
            return Ok(result);
        }

        [HttpPost("{id:guid}/accept")]
        public async Task<ActionResult<FriendResponseDto>> Accept(Guid id)
        {
            var userGuid = User.GetUserGuid();
            var result = await _friends.AcceptFriendAsync(userGuid, id);
            await NotifyFriendsAsync(userGuid, result.FriendGuid);
            return Ok(result);
        }

        [HttpPost("{id:guid}/reject")]
        public async Task<IActionResult> Reject(Guid id)
        {
            var userGuid = User.GetUserGuid();
            var (requesterGuid, addresseeGuid) = await _friends.GetFriendshipUsersAsync(id);
            await _friends.RejectFriendAsync(userGuid, id);
            await NotifyFriendsAsync(requesterGuid, addresseeGuid);
            return NoContent();
        }

        [HttpPost("{id:guid}/block")]
        public async Task<ActionResult<FriendResponseDto>> Block(Guid id)
        {
            var userGuid = User.GetUserGuid();
            var result = await _friends.BlockFriendAsync(userGuid, id);
            await NotifyFriendsAsync(userGuid, result.FriendGuid);
            return Ok(result);
        }

        [HttpDelete("{id:guid}")]
        public async Task<IActionResult> Remove(Guid id)
        {
            var userGuid = User.GetUserGuid();
            var (requesterGuid, addresseeGuid) = await _friends.GetFriendshipUsersAsync(id);
            await _friends.RemoveFriendAsync(userGuid, id);
            await NotifyFriendsAsync(requesterGuid, addresseeGuid);
            return NoContent();
        }
    }
}
