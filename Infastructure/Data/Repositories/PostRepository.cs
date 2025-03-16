using Domain.Common;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using static Domain.Common.Enums;

namespace Infrastructure.Data.Repositories
{
    public class PostRepository :BaseRepository<Post> ,IPostRepository
    {
        public PostRepository(AppDbContext context) : base(context)
        {
        }

        public override Task<bool> DeleteAsync(Guid id)
        {
            throw new NotImplementedException();
        }

        public override Task<Post?> GetByIdAsync(Guid id)
        {
            throw new NotImplementedException();
        }

        public async Task<IEnumerable<Post>> GetPostsByApprovalStatusAsync(ApprovalStatusEnum approvalStatusEnum)
        {
            return await _context.Posts
                .Where(x => x.ApprovalStatus == approvalStatusEnum )
                .ToListAsync();
        }

        public async Task<List<Post>> GetAllPostsAsync(CancellationToken cancellationToken)
        {
            return await _context.Posts
                 .Include(p => p.User)         // Lấy thông tin người đăng bài
                 .Include(p => p.Comments)
                     .ThenInclude(c => c.User) // Lấy thông tin người bình luận
                 .Include(p => p.Likes)
                     .ThenInclude(l => l.User) // ⚠️ Thêm Include(User) vào đây
                 .Include(p => p.Shares)
                     .ThenInclude(s => s.User) // Lấy thông tin người chia sẻ
                 .ToListAsync(cancellationToken);
        }

        public async Task<IEnumerable<Post>> GetPostsByTypeAsync(PostTypeEnum postTypeEnum)
        {
            return await _context.Posts
                .Include(p => p.User)
                .Include(p => p.Comments)
                     .ThenInclude(c => c.User) // Lấy thông tin người bình luận
                 .Include(p => p.Likes)
                     .ThenInclude(l => l.User) // ⚠️ Thêm Include(User) vào đây
                 .Include(p => p.Shares)
                     .ThenInclude(s => s.User) // Lấy thông tin người chia sẻ
                .Where(p => p.PostType == postTypeEnum)
                .ToListAsync();
        }

    }
}
