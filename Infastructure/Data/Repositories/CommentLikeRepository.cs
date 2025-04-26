using Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Infrastructure.Data.Repositories
{
    public class CommentLikeRepository : BaseRepository<CommentLike>, ICommentLikeRepository
    {
        public CommentLikeRepository(AppDbContext context) : base(context)
        {
        }

        public async Task<int> CountLikesAsync(Guid commentId)
        {
            return await _context.CommentLikes.CountAsync(x => x.CommentId == commentId && x.IsLike);
        }
        public async Task<List<CommentLike>> GetLikesByCommentIdsAsync(List<Guid> commentIds)
        {
            return await _context.CommentLikes
                .Where(cl => commentIds.Contains(cl.CommentId) && cl.IsLike)
                .ToListAsync();
        }
        public override Task<bool> DeleteAsync(Guid id)
        {
            throw new NotImplementedException();
        }

        public async Task<CommentLike?> GetLikeAsync(Guid userId, Guid commentId)
        {
            return await _context.CommentLikes.FirstOrDefaultAsync(x => x.UserId == userId && x.CommentId == commentId);
        }
        public async Task<List<User?>> GetLikedByCommentIdAsync(Guid commentId)
        {
            return await _context.CommentLikes
                    .Where(cl => cl.CommentId == commentId && cl.IsLike)
                    .Select(cl => cl.User)
                    .Where(u => u != null) // Loại bỏ User null
                    .ToListAsync();
        }

        public async Task<List<User>> GetLikedUsersAsync(Guid commentId)
        {
            return await _context.CommentLikes
                            .Include(cl => cl.User) 
                            .Include(cl => cl.Comment)
                                .ThenInclude(c => c.User)
                          .Where(cl => cl.CommentId == commentId && cl.IsLike && cl.User != null)
                          .Select(cl => cl.User!)
                          .ToListAsync();
        }
        public async Task<List<CommentLike>> GetCommentLikeByCommentIdAsync(Guid CommentId)
        {
            return await _context.CommentLikes
                .Where(c => c.CommentId == CommentId)
                .ToListAsync();
        }
        public async Task<(List<User>, Guid?)> GetLikedUsersWithCursorAsync(Guid commentId, Guid? lastUserId)
        {
            int pageSize = 2; // 📌 Set cứng lấy 2 người

            var query = _context.CommentLikes
                .Include(cl => cl.User)
                    .Include(cl => cl.Comment)
                                .ThenInclude(c => c.User)
                .Where(cl => cl.CommentId == commentId && cl.IsLike && cl.User != null)
                .OrderBy(cl => cl.UserId) // Sắp xếp để cursor hoạt động đúng
                .Select(cl => cl.User!);

            if (lastUserId.HasValue)
            {
                query = query.Where(u => u.Id.CompareTo(lastUserId.Value) > 0);
            }

            var likedUsers = await query.Take(pageSize).ToListAsync();

            // Nếu danh sách nhỏ hơn pageSize thì không có dữ liệu tiếp theo → nextCursor = null
            Guid? nextCursor = likedUsers.Count < pageSize ? null : likedUsers.Last().Id;

            return (likedUsers, nextCursor);
        }

        public async Task<bool> CheckLikeComment(Guid commentId, Guid userId)
        {
            return await _context.CommentLikes.AnyAsync(l => l.CommentId == commentId && l.UserId == userId);
        }
    }
}
