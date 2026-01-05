using System.Collections.Generic;
using backend.Context;
using backend.DTO.FriendDtos;
using backend.Interfaces;
using backend.Models;
using Microsoft.EntityFrameworkCore;

namespace backend.Services
{
    public class FriendService(VoxlockDbContext db) : IFriendService
    {
        private readonly VoxlockDbContext _db = db;

        public async Task<List<FriendResponseDto>> GetFriendsAsync(Guid userGuid)
        {
            return await _db.Friendships
                .Include(f => f.Requester)
                .Include(f => f.Addressee)
                .Where(f => f.Status == FriendshipStatuses.Accepted &&
                            (f.RequesterGuid == userGuid || f.AddresseeGuid == userGuid))
                .Select(f => Map(f, f.RequesterGuid == userGuid ? f.Addressee : f.Requester, userGuid))
                .ToListAsync();
        }
        public async Task<List<Guid>> GetFriendGuidsAsync(Guid userGuid)
        {
            return await _db.Friendships
                .Where(f => f.Status == FriendshipStatuses.Accepted &&
                            (f.RequesterGuid == userGuid || f.AddresseeGuid == userGuid))
                .Select(f => f.RequesterGuid == userGuid ? f.Addressee.UserGuid : f.RequesterGuid)
                .ToListAsync();
        }
        public async Task<List<FriendResponseDto>> GetIncomingRequestsAsync(Guid userGuid)
        {
            return await _db.Friendships
                .Include(f => f.Requester)
                .Include(f => f.Addressee)
                .Where(f => f.Status == FriendshipStatuses.Pending &&
                            f.AddresseeGuid == userGuid)
                .Select(f => new FriendResponseDto
                {
                    FriendshipGuid = f.FriendshipGuid,
                    FriendGuid = f.Requester.UserGuid,
                    UserName = f.Requester.UserName,
                    DisplayName = f.Requester.DisplayName,
                    AvatarKey = f.Requester.AvatarKey,
                    Presence = f.Requester.Status,
                    RelationshipStatus = f.Status,
                    CreatedAt = f.CreatedAt,
                    IsIncoming = true,
                    IsOutgoing = false
                })
                .ToListAsync();
        }

        public async Task<List<FriendResponseDto>> GetOutgoingRequestsAsync(Guid userGuid)
        {
            return await _db.Friendships
                .Include(f => f.Requester)
                .Include(f => f.Addressee)
                .Where(f => f.Status == FriendshipStatuses.Pending &&
                            f.RequesterGuid == userGuid)
                .Select(f => new FriendResponseDto
                {
                    FriendshipGuid = f.FriendshipGuid,
                    FriendGuid = f.Addressee.UserGuid,
                    UserName = f.Addressee.UserName,
                    DisplayName = f.Addressee.DisplayName,
                    AvatarKey = f.Addressee.AvatarKey,
                    Presence = f.Addressee.Status,
                    RelationshipStatus = f.Status,
                    CreatedAt = f.CreatedAt,
                    IsIncoming = false,
                    IsOutgoing = true
                })
                .ToListAsync();
        }

        public async Task<FriendResponseDto> AddFriendAsync(Guid requesterGuid, Guid friendGuid)
        {
            if (requesterGuid == Guid.Empty)
                throw new ArgumentException("Requester is required.");

            if (friendGuid == Guid.Empty)
                throw new ArgumentException("Friend is required.");

            if (requesterGuid == friendGuid)
                throw new InvalidOperationException("You cannot add yourself.");

            var friend = await _db.Users.FirstOrDefaultAsync(u => u.UserGuid == friendGuid);
            if (friend == null)
                throw new InvalidOperationException("User not found.");

            var existing = await _db.Friendships
                .Include(f => f.Requester)
                .Include(f => f.Addressee)
                .FirstOrDefaultAsync(f =>
                    (f.RequesterGuid == requesterGuid && f.AddresseeGuid == friendGuid) ||
                    (f.RequesterGuid == friendGuid && f.AddresseeGuid == requesterGuid));

            if (existing != null)
            {
                if (existing.Status == FriendshipStatuses.Blocked)
                    throw new InvalidOperationException("You cannot add this user.");

                
                if (existing.Status == FriendshipStatuses.Pending &&
                    existing.RequesterGuid == friendGuid &&
                    existing.AddresseeGuid == requesterGuid)
                {
                    existing.Status = FriendshipStatuses.Accepted;
                    existing.UpdatedAt = DateTime.UtcNow;
                    await _db.SaveChangesAsync();

                    var acceptedFriend = existing.RequesterGuid == requesterGuid ? existing.Addressee : existing.Requester;
                    return Map(existing, acceptedFriend, requesterGuid);
                }

                // If already sent or already friends, just return current state
                var existingFriend = existing.RequesterGuid == requesterGuid ? existing.Addressee : existing.Requester;
                return Map(existing, existingFriend, requesterGuid);
            }

            var friendship = new Friendships
            {
                FriendshipGuid = Guid.NewGuid(),
                RequesterGuid = requesterGuid,
                AddresseeGuid = friendGuid,
                Status = FriendshipStatuses.Pending,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            _db.Friendships.Add(friendship);
            await _db.SaveChangesAsync();

            return Map(friendship, friend, requesterGuid);
        }

        public async Task<FriendResponseDto> AcceptFriendAsync(Guid userGuid, Guid friendshipGuid)
        {
            var friendship = await _db.Friendships
                .Include(f => f.Requester)
                .Include(f => f.Addressee)
                .FirstOrDefaultAsync(f => f.FriendshipGuid == friendshipGuid);

            if (friendship == null)
                throw new InvalidOperationException("Request not found.");

            if (friendship.AddresseeGuid != userGuid)
                throw new UnauthorizedAccessException("Only the recipient can accept the request.");

            if (friendship.Status == FriendshipStatuses.Blocked)
                throw new InvalidOperationException("This request is blocked.");

            friendship.Status = FriendshipStatuses.Accepted;
            friendship.UpdatedAt = DateTime.UtcNow;
            await _db.SaveChangesAsync();

            var friendUser = friendship.Requester;
            return Map(friendship, friendUser, userGuid);
        }

        public async Task RejectFriendAsync(Guid userGuid, Guid friendshipGuid)
        {
            var friendship = await _db.Friendships
                .FirstOrDefaultAsync(f => f.FriendshipGuid == friendshipGuid);

            if (friendship == null)
                return;

            if (friendship.AddresseeGuid != userGuid)
                throw new UnauthorizedAccessException("Only the recipient can reject the request.");

            _db.Friendships.Remove(friendship);
            await _db.SaveChangesAsync();
        }

        public async Task<FriendResponseDto> BlockFriendAsync(Guid userGuid, Guid friendshipGuid)
        {
            var friendship = await _db.Friendships
                .Include(f => f.Requester)
                .Include(f => f.Addressee)
                .FirstOrDefaultAsync(f => f.FriendshipGuid == friendshipGuid);

            if (friendship == null)
                throw new InvalidOperationException("Friendship not found.");

            if (friendship.RequesterGuid != userGuid && friendship.AddresseeGuid != userGuid)
                throw new UnauthorizedAccessException("You cannot block this request.");

            friendship.Status = FriendshipStatuses.Blocked;
            friendship.UpdatedAt = DateTime.UtcNow;
            friendship.BlockedByGuid = userGuid;
            await _db.SaveChangesAsync();

            var friendUser = friendship.RequesterGuid == userGuid ? friendship.Addressee : friendship.Requester;
            return Map(friendship, friendUser, userGuid);
        }
        public async Task<List<FriendResponseDto>> GetBlockedAsync(Guid userGuid)
        {
            return await _db.Friendships
                   .Include(friend => friend.Requester)
                   .Include(friend => friend.Addressee)
                   .Where(friend => friend.Status == FriendshipStatuses.Blocked &&
                                    friend.BlockedByGuid == userGuid)
                    .Select(friend => Map(friend, friend.RequesterGuid == userGuid ? friend.Addressee : friend.Requester, userGuid))
                    .ToListAsync();
        }

        public async Task UnblockFriendAsync(Guid userGuid, Guid friendshipGuid)
        {
            var friendship = await _db.Friendships
                .FirstOrDefaultAsync(friend => friend.FriendshipGuid == friendshipGuid);

            if(friendship == null)
            {
                throw new InvalidOperationException("Friendship not found.");
            }

            if(friendship.BlockedByGuid != userGuid)
            {
                throw new UnauthorizedAccessException("You cannot unblock this friendship.");
            }

            _db.Friendships.Remove(friendship);
            await _db.SaveChangesAsync();
        }
        public async Task RemoveFriendAsync(Guid userGuid, Guid friendshipGuid)
        {
            var friendship = await _db.Friendships
                .FirstOrDefaultAsync(f => f.FriendshipGuid == friendshipGuid);

            if (friendship == null)
                return;

            if (friendship.RequesterGuid != userGuid && friendship.AddresseeGuid != userGuid)
                throw new UnauthorizedAccessException("You cannot remove this friendship.");

            _db.Friendships.Remove(friendship);
            await _db.SaveChangesAsync();
        }

        public async Task<(Guid RequesterGuid, Guid AddresseeGuid)> GetFriendshipUsersAsync(Guid friendshipGuid)
        {
            var friendship = await _db.Friendships
                .AsNoTracking()
                .Where(f => f.FriendshipGuid == friendshipGuid)
                .Select(f => new { f.RequesterGuid, f.AddresseeGuid })
                .FirstOrDefaultAsync();

            if (friendship == null)
            {
                return (Guid.Empty, Guid.Empty);
            }

            return (friendship.RequesterGuid, friendship.AddresseeGuid);
        }

        private static FriendResponseDto Map(Friendships friendship, Users friend, Guid currentUserGuid)
        {
            return new FriendResponseDto
            {
                FriendshipGuid = friendship.FriendshipGuid,
                FriendGuid = friend.UserGuid,
                UserName = friend.UserName,
                DisplayName = friend.DisplayName,
                AvatarKey = friend.AvatarKey,
                Presence = friend.Status,
                RelationshipStatus = friendship.Status,
                CreatedAt = friendship.CreatedAt,
                IsIncoming = friendship.AddresseeGuid == currentUserGuid,
                IsOutgoing = friendship.RequesterGuid == currentUserGuid
            };
        }
    }
}
