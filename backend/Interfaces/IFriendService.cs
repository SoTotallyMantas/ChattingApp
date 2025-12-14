using System.Collections.Generic;
using backend.DTO.FriendDtos;

namespace backend.Interfaces
{
    public interface IFriendService
    {
        Task<List<FriendResponseDto>> GetFriendsAsync(Guid userGuid);
        Task<FriendResponseDto> AddFriendAsync(Guid requesterGuid, Guid friendGuid);
    }
}
