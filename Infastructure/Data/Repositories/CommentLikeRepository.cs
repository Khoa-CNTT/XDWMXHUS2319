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
            return await _context.CommentLikes.CountAsync(x => x.CommentId == commentId);
        }

        public override Task<bool> DeleteAsync(Guid id)
        {
            throw new NotImplementedException();
        }

        public async Task<CommentLike?> GetLikeAsync(Guid userId, Guid commentId)
        {
            return await _context.CommentLikes.FirstOrDefaultAsync(x => x.UserId == userId && x.CommentId == commentId);
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
    }
}
