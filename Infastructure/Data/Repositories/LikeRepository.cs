using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Infrastructure.Data.Repositories
{
    public class LikeRepository : BaseRepository<Like>, ILikeRepository
    {
        public LikeRepository(AppDbContext context) : base(context)
        {
        }

        public async Task AddRangeAsync(IEnumerable<Like> entities)
        {
            //viết logic thêm nhiều like vào db
            await _context.AddRangeAsync(entities);
        }

        public override Task<bool> DeleteAsync(Guid id)
        {
            throw new NotImplementedException();
        }

        public async Task<Like?> GetLikeByPostIdAsync(Guid postId,Guid userId)
        {
            return await _context.Likes.FirstOrDefaultAsync(l => l.PostId == postId && l.UserId == userId);
        }

        public async Task<List<Like>> GetLikesByPostIdAsync(Guid postId, int page, int pageSize)
        {
            return await _context.Likes
            .Where(l => l.PostId == postId)
            .OrderByDescending(l => l.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Include(l => l.User) // Load thông tin User
            .ToListAsync();
        }
        public async Task<List<Like>> GetLikesByPostIdDeleteAsync(Guid postId)
        {
            return await _context.Likes
                .Where(l => l.PostId == postId && !l.IsDeleted)
                .ToListAsync();
        }
        public Task<int> GetLikeCountAsync(Guid userId)
        {
            return _context.Likes.CountAsync(l => l.UserId == userId);
        }

        public async Task<bool> CheckLike(Guid postId, Guid userId)
        {
            return await _context.Likes.AnyAsync(l => l.PostId == postId && l.UserId == userId);
        }
    }
}
