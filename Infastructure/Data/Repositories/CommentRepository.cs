using Application.DTOs.Comments;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Text;
using System.Threading.Tasks;

namespace Infrastructure.Data.Repositories
{
    public class CommentRepository : BaseRepository<Comment>, ICommentRepository
    {
        public CommentRepository(AppDbContext context) : base(context)
        {
        }

        public async Task<int> CountPostCommentAsync(Expression<Func<Comment, bool>> predicate)
        {
            return await _context.Comments.CountAsync(predicate);
        }

        public override Task<bool> DeleteAsync(Guid id)
        {
            throw new NotImplementedException();
        }

        public async Task<IEnumerable<Comment>> GetCommentByPostIdAsync(Guid postId)
        {
            return await _context.Comments
         .Include(c => c.User)
         .Include(c => c.Post)
             .ThenInclude(p => p.User)
         .Include(c => c.CommentLikes)
             .ThenInclude(cl => cl.User) // Lấy danh sách người like bình luận
         .Include(c => c.Replies)
             .ThenInclude(r => r.User)
         .Include(c => c.Replies)
             .ThenInclude(r => r.CommentLikes) // Lấy lượt like của reply
                 .ThenInclude(cl => cl.User)
         .Where(c => c.PostId == postId && !c.IsDeleted)
         .ToListAsync();
        }
        public async Task<Comment?> GetCommentByIdAsync(Guid commentId)
        {
            var comment = await _context.Comments
         .Include(c => c.User)
         .Include(c => c.CommentLikes)
             .ThenInclude(cl => cl.User)
         .Include(c => c.Replies)
             .ThenInclude(r => r.User)
         .Include(c => c.Replies) // Lấy danh sách comment con
             .ThenInclude(r => r.CommentLikes) // Lấy danh sách like của comment con
                 .ThenInclude(cl => cl.User) // Lấy thông tin user đã like comment con
         .FirstOrDefaultAsync(c => c.Id == commentId && !c.IsDeleted);
            return comment;
        }

        public async Task<List<Comment>> GetReplysCommentAllAsync(Guid parentCommentId)
        {
            return await _context.Comments
           .Where(c => c.ParentCommentId == parentCommentId && !c.IsDeleted)
           .ToListAsync();
        }
    }
}
