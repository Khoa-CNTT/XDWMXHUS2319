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

        public async Task<(List<Comment>, int)> GetCommentByPostIdAsync(Guid postId, int page, int pageSize)
        {
            var query = _context.Comments
              .Include(c => c.User)
              .Include(c => c.Post)
                  .ThenInclude(p => p.User)
              .Include(c => c.CommentLikes) // Lấy danh sách Like của comment
              .Include(c => c.Replies)
                  .ThenInclude(r => r.User)
              .Include(c => c.Replies)
                  .ThenInclude(r => r.CommentLikes) // Lấy danh sách Like của replies
              .Where(c => c.PostId == postId && !c.IsDeleted && c.ParentCommentId == null);

            int totalRecords = await query.CountAsync(); // Tổng số bình luận

            var comments = await query
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            // 📌 **Lọc Like của Comment & Reply sau khi truy vấn**
            foreach (var comment in comments)
            {
                comment.CommentLikes = comment.CommentLikes.Where(cl => cl.IsLike).ToList();

                foreach (var reply in comment.Replies)
                {
                    reply.CommentLikes = reply.CommentLikes.Where(cl => cl.IsLike).ToList();
                }
            }
            return (comments, totalRecords);
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

        public async Task<List<Comment>> GetCommentsByPostIdAsync(Guid postId, int page, int pageSize)
        {
            return await _context.Comments
            .Where(c => c.PostId == postId)
            .OrderByDescending(c => c.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Include(c => c.User) // Load thông tin User
            .ToListAsync();
        }

        public async Task<List<Comment>> GetCommentsByPostIdDeleteAsync(Guid postId)
        {
            return await _context.Comments
                .Where(c => c.PostId == postId && !c.IsDeleted)
                .ToListAsync();
        }

        public async Task<List<Comment>> GetRepliesByCommentIdAsync(Guid parentCommentId)
        {
            return await _context.Comments
                .Where(c => c.ParentCommentId == parentCommentId && !c.IsDeleted)
                .ToListAsync();
        }
        public Task<int> GetCommentCountAsync(Guid userId)
        {
            return _context.Comments.CountAsync(c => c.UserId == userId);
        }


        public async Task<List<Comment>> GetAllCommentByUserIdAsync(Guid userId)
        {
            return await _context.Comments
                .Where(c => c.UserId == userId && !c.IsDeleted)
                .ToListAsync();
        }
    }
}
