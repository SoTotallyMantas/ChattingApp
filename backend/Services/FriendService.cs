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
                .Select(f => new
                {
                    Friendship = f,
                    FriendUser = f.RequesterGuid == userGuid ? f.Addressee : f.Requester
                })
                .Select(x => new FriendResponseDto
                {
                    FriendshipGuid = x.Friendship.FriendshipGuid,
                    FriendGuid = x.FriendUser.UserGuid,
                    UserName = x.FriendUser.UserName,
                    DisplayName = x.FriendUser.DisplayName,
                    AvatarKey = x.FriendUser.AvatarKey,
                    Presence = x.FriendUser.Status,
                    RelationshipStatus = x.Friendship.Status,
                    CreatedAt = x.Friendship.CreatedAt
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
                if (existing.Status != FriendshipStatuses.Accepted)
                {
                    existing.Status = FriendshipStatuses.Accepted;
                    existing.UpdatedAt = DateTime.UtcNow;
                    await _db.SaveChangesAsync();
                }

                var existingFriend = existing.RequesterGuid == requesterGuid ? existing.Addressee : existing.Requester;
                return Map(existing, existingFriend);
            }

            var friendship = new Friendships
            {
                FriendshipGuid = Guid.NewGuid(),
                RequesterGuid = requesterGuid,
                AddresseeGuid = friendGuid,
                Status = FriendshipStatuses.Accepted,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            _db.Friendships.Add(friendship);
            await _db.SaveChangesAsync();

            return Map(friendship, friend);
        }

        private static FriendResponseDto Map(Friendships friendship, Users friend)
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
                CreatedAt = friendship.CreatedAt
            };
        }
    }
}
