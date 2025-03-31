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
        public async Task<List<Share>> GetSharesByPostIdAsync(Guid postId)
        {
            return await _context.Shares
                .Where(s => s.PostId == postId && !s.IsDeleted)
                .ToListAsync();
        }
        public async Task<List<Share>> GetSharedUsersByPostIdWithCursorAsync(Guid postId, Guid? lastUserId, int pageSize, CancellationToken cancellationToken)
        {

            const int PAGE_SIZE = 10; // 🔥 Giới hạn cố định 10 người
            pageSize = Math.Min(pageSize, PAGE_SIZE); // Đảm bảo không vượt quá 10

            var query = _context.Shares
                .Where(s => s.PostId == postId)
                .OrderByDescending(s => s.CreatedAt); // ⚠️ OrderByDescending trả về IOrderedQueryable

            // Nếu có LastUserId, lấy những user có CreatedAt nhỏ hơn
            if (lastUserId.HasValue)
            {
                var lastUserShare = await _context.Shares.FirstOrDefaultAsync(s => s.User.Id == lastUserId.Value);
                if (lastUserShare != null)
                {
                    query = query.Where(s => s.CreatedAt < lastUserShare.CreatedAt)
                                 .OrderByDescending(s => s.CreatedAt); // 🔥 Sắp xếp lại để giữ kiểu IOrderedQueryable
                }
            }

            // Thêm Include sau khi đã xử lý các điều kiện lọc
            return await query
                .Include(s => s.User) // Đặt Include ở đây
                .Take(pageSize) // Giới hạn tối đa 10 người
                .ToListAsync(cancellationToken);
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
              .Where(s => (s.Content != null && s.Content.Contains(keyword)) ||
                            (s.User != null && s.User.FullName.Contains(keyword)))
              .ToListAsync();
        }
        public async Task<List<Post>> GetSharedPostAllDeleteAsync(Guid originalPostId)
        {
            return await _context.Posts
                .Where(p => p.OriginalPostId == originalPostId && !p.IsDeleted)
                .ToListAsync();
        }
        public Task<int> GetShareCountAsync(Guid userId)
        {
            return _context.Shares.CountAsync(s => s.UserId == userId);
        }
    }
}