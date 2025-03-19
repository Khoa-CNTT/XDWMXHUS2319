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
                .Include(x => x.User)
                .Include(x => x.Post)
                    .ThenInclude(p => p.User)
                 .Where(x => x.PostId == postId)
                .ToListAsync();
        }
    }
}
