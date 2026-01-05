using System.Collections.Generic;
using backend.DTO.FriendDtos;

namespace backend.Interfaces
{
    public interface IFriendService
    {
        Task<List<FriendResponseDto>> GetFriendsAsync(Guid userGuid);
        Task<FriendResponseDto> AddFriendAsync(Guid requesterGuid, Guid friendGuid);
        Task<List<FriendResponseDto>> GetIncomingRequestsAsync(Guid userGuid);
        Task<List<FriendResponseDto>> GetOutgoingRequestsAsync(Guid userGuid);
        Task<FriendResponseDto> AcceptFriendAsync(Guid userGuid, Guid friendshipGuid);
        Task RejectFriendAsync(Guid userGuid, Guid friendshipGuid);
        Task<FriendResponseDto> BlockFriendAsync(Guid userGuid, Guid friendshipGuid);
        Task RemoveFriendAsync(Guid userGuid, Guid friendshipGuid);
        Task<List<Guid>> GetFriendGuidsAsync(Guid userGuid);
        Task<(Guid RequesterGuid, Guid AddresseeGuid)> GetFriendshipUsersAsync(Guid friendshipGuid);
        Task<List<FriendResponseDto>> GetBlockedAsync(Guid userGuid);
        Task UnblockFriendAsync(Guid userGuid, Guid friendshipGuid);
    }
}
