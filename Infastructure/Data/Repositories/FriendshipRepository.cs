﻿using Application.DTOs.FriendShips;
using Domain.Entities;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using static Domain.Common.Enums;

namespace Infrastructure.Data.Repositories
{
    public class FriendshipRepository : BaseRepository<Friendship>, IFriendshipRepository
    {
        public FriendshipRepository(AppDbContext context) : base(context)
        {
        }

        public async override Task<bool> DeleteAsync(Guid id)
        {
            var entity = await _context.Friendships.FindAsync(id);
            if (entity == null)
                return false;

            _context.Friendships.Remove(entity);
            return true;
        }
        public async Task<Friendship?> GetFriendshipAsync(Guid userId1, Guid userId2)
        {
            return await _context.Friendships
                .FirstOrDefaultAsync(f =>
                    (f.UserId == userId1 && f.FriendId == userId2) ||
                    (f.UserId == userId2 && f.FriendId == userId1));
        }

        public async Task<bool> ExistsAsync(Guid userId, Guid friendId, CancellationToken cancellationToken = default)
        {
            return await _context.Friendships.AnyAsync(
            f => (f.UserId == userId && f.FriendId == friendId)
              || (f.UserId == friendId && f.FriendId == userId),
            cancellationToken);
        }

        public async Task<List<Friendship>> GetFriendsAsync(Guid userId)
        {
            return await _context.Friendships
                .Where(f => f.Status == FriendshipStatusEnum.Accepted &&
                            (f.UserId == userId || f.FriendId == userId))
                .ToListAsync();
        }

        public async Task<Friendship?> GetPendingRequestAsync(Guid senderId, Guid receiverId)
        {
            return await _context.Friendships
                  .FirstOrDefaultAsync(f =>
                      f.UserId == senderId &&
                      f.FriendId == receiverId &&
                      f.Status == FriendshipStatusEnum.Pending);
        }

        public async Task<List<Friendship>> GetReceivedRequestsAsync(Guid userId)
        {
            return await _context.Friendships
                .Where(f => f.FriendId == userId && f.Status == FriendshipStatusEnum.Pending)
                .ToListAsync();
        }

        public async Task<List<Friendship>> GetSentRequestsAsync(Guid userId)
        {
            return await _context.Friendships
                .Where(f => f.UserId == userId && f.Status == FriendshipStatusEnum.Pending)
                .ToListAsync();
        }
    }
}
