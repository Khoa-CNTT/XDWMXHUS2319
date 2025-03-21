using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Text;
using System.Threading.Tasks;

namespace Infrastructure.Data.Repositories
{
    public class ShareRepository : BaseRepository<Share>, IShareRepository
    {
        public ShareRepository(AppDbContext context) : base(context)
        {
        }

        public async Task<int> CountPostShareAsync(Expression<Func<Share, bool>> predicate)
        {
            return await _context.Shares.CountAsync(predicate);
        }

        public override Task<bool> DeleteAsync(Guid id)
        {
            throw new NotImplementedException();
        }

        public async Task<List<Share>> GetSharesByPostIdAsync(Guid postId, int page, int pageSize)
        {
            return await _context.Shares
            .Where(s => s.PostId == postId)
            .OrderByDescending(s => s.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Include(s => s.User) // Load thông tin User
            .ToListAsync();
        }
        public async Task<List<Share>> SearchSharesAsync(string keyword)
        {
            return await _context.Shares
              .Include(s => s.User)
              .Include(s => s.Post)
              .ThenInclude(p => p.User)
              .Where(s => s.Content.Contains(keyword) || s.User.FullName.Contains(keyword))
              .ToListAsync();
        }
        public async Task<List<Post>> GetSharedPostAllDeleteAsync(Guid originalPostId)
        {
            return await _context.Posts
                .Where(p => p.OriginalPostId == originalPostId && !p.IsDeleted)
                .ToListAsync();
        }
    }
}