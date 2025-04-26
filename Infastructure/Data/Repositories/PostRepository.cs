using Domain.Common;
using Domain.Entities;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using static Domain.Common.Enums;

namespace Infrastructure.Data.Repositories
{
    public class PostRepository : BaseRepository<Post>, IPostRepository
    {

        public PostRepository(AppDbContext context) : base(context)
        {
        }

        public override Task<bool> DeleteAsync(Guid id)
        {
            throw new NotImplementedException();
        }
        public async Task<Guid> GetPostOwnerIdAsync(Guid postId)
        {
            return await _context.Posts
                .Where(p => p.Id == postId) // ✅ Lọc bài viết theo ID
                .Select(p => p.UserId) // ✅ Lấy OwnerId (chủ sở hữu)
                .FirstOrDefaultAsync(); // ✅ Lấy giá trị đầu tiên (hoặc null nếu không có)

        }

        public override async Task<Post?> GetByIdAsync(Guid id)
        {
            return await _context.Posts
                    .Include(p => p.User)
                .Include(p => p.Comments).ThenInclude(c => c.User).ThenInclude(c => c.CommentLikes)
                .Include(p => p.Likes).ThenInclude(l => l.User)
                .Include(p => p.Shares).ThenInclude(s => s.User)
                .Include(p => p.OriginalPost) // Load bài gốc
                    .ThenInclude(op => op.Comments) // Load comments của bài gốc
                    .ThenInclude(c => c.User)
                .Include(p => p.OriginalPost)
                    .ThenInclude(op => op.Likes) // Load likes của bài gốc
                    .ThenInclude(l => l.User)
                .Include(p => p.OriginalPost)
                    .ThenInclude(op => op.Shares) // Load shares của bài gốc
                    .ThenInclude(s => s.User)
                    .FirstOrDefaultAsync(p => p.Id == id);
        }
        public async Task<IEnumerable<Post>> GetPostsByApprovalStatusAsync(ApprovalStatusEnum approvalStatusEnum)
        {
            return await _context.Posts
                .Where(x => x.ApprovalStatus == approvalStatusEnum )
                .ToListAsync();
        }

        public async Task<List<Post>> GetAllPostsAsync(Guid? lastPostId, int pageSize, CancellationToken cancellationToken)
        {

            const int PAGE_SIZE = 10;

            var query = _context.Posts
                 .Include(p => p.User)
                 .Include(p => p.Likes.Where(l => l.IsLike))
                     .ThenInclude(l => l.User)
                 .Include(p => p.Comments.Where(c => !c.IsDeleted))
                     .ThenInclude(c => c.User)
                 .Include(p => p.Shares.Where(s => !s.IsDeleted))
                     .ThenInclude(s => s.User)
                 .Include(p => p.OriginalPost)
                     .ThenInclude(op => op.User)
                 .Where(p => !p.IsDeleted && p.Scope == 0 && (p.IsApproved || p.ApprovalStatus == ApprovalStatusEnum.Approved));// Chỉ lấy bài chưa bị xóa
                 

            // Nếu có LastPostId, chỉ lấy bài viết cũ hơn nó
            if (lastPostId.HasValue)
            {
                var lastPost = await _context.Posts.FindAsync(lastPostId.Value);
                if (lastPost != null)
                {
                    query = query.Where(p => p.CreatedAt < lastPost.CreatedAt);
                }
            }
            query = query.OrderByDescending(p => p.CreatedAt);

            return await query
                .Take(PAGE_SIZE)
                .ToListAsync(cancellationToken);
        }

        public async Task<List<Post>> GetPostsByOwnerAsync(Guid userId, Guid? lastPostId, int pageSize, CancellationToken cancellationToken)
        {
            const int PAGE_SIZE = 10;
            var query = _context.Posts
               .Include(p => p.User)
               .Include(p => p.Likes.Where(l => l.IsLike))
               .Include(p => p.Comments.Where(c => !c.IsDeleted))
               .Include(p => p.Shares.Where(s => !s.IsDeleted))
               .Include(p => p.OriginalPost)
                   .ThenInclude(op => op.User)
               .Where(p => p.UserId == userId && !p.IsDeleted && (p.IsApproved || p.ApprovalStatus == ApprovalStatusEnum.Approved));

            // Nếu có LastPostId, lấy bài viết cũ hơn bài cuối cùng đã tải
            if (lastPostId.HasValue)
            {
                var lastPost = await _context.Posts.FindAsync(lastPostId.Value);
                if (lastPost != null)
                {
                    query = query.Where(p => p.CreatedAt < lastPost.CreatedAt);
                }
            }

            // Áp dụng OrderBy sau cùng để đảm bảo kiểu dữ liệu đúng
            query = query.OrderByDescending(p => p.CreatedAt);

            return await query
                .Take(PAGE_SIZE)
                .ToListAsync(cancellationToken);
        }

        public async Task<List<Post>> GetPostsByTypeAsync(PostTypeEnum postType, Guid? lastPostId, int pageSize, CancellationToken cancellationToken)
        {
            const int PAGE_SIZE = 10;

            var query = _context.Posts
                .Include(p => p.User)
                .Include(p => p.Likes.Where(l => l.IsLike))
                    .ThenInclude(l => l.User)
                .Include(p => p.Comments.Where(c => !c.IsDeleted))
                    .ThenInclude(c => c.User)
                .Include(p => p.Shares.Where(s => !s.IsDeleted))
                    .ThenInclude(s => s.User)
                .Include(p => p.OriginalPost)
                    .ThenInclude(op => op.User)
                .Where(p => !p.IsDeleted && p.PostType == postType && (p.IsApproved || p.ApprovalStatus == ApprovalStatusEnum.Approved)) // Chỉ lấy bài chưa bị xóa và có loại đúng
                .OrderByDescending(p => p.CreatedAt); // Sắp xếp bài mới nhất trước

            // Nếu có lastPostId, chỉ lấy bài viết cũ hơn nó
            if (lastPostId.HasValue)
            {
                var lastPost = await _context.Posts.FindAsync(lastPostId.Value);
                if (lastPost != null)
                {
                    query = query.Where(p => p.CreatedAt < lastPost.CreatedAt)
                                 .OrderByDescending(p => p.CreatedAt); // Sắp xếp lại sau khi lọc
                }
            }

            return await query
                .Take(PAGE_SIZE)
                .ToListAsync(cancellationToken);
        }

        //timkiem nguoi dung(dangg)
        public async Task<List<Post>> SearchPostsAsync(string keyword, DateTime? fromDate, DateTime? toDate, int? Year, int? Month, int? Day)
        {
            var query = _context.Posts
         .Include(p => p.User)
         .Include(p => p.Comments.Where(c => !c.IsDeleted))
         .Include(p => p.Likes.Where(l => l.IsLike)) // Sửa lỗi chỗ này
                .ThenInclude(l => l.User)
         .Include(p => p.Shares.Where(s => !s.IsDeleted))
        .Where(p => p.Content.Contains(keyword) || p.User != null && p.User.FullName.Contains(keyword));

            if (fromDate.HasValue)
            {
                var startDate = fromDate.Value.Date; // Lấy từ 00:00:00 của ngày
                query = query.Where(p => p.CreatedAt >= startDate);
            }
            if (toDate.HasValue)
            {
                var endDate = toDate.Value.Date.AddDays(1).AddTicks(-1); // Lấy đến 23:59:59.999
                query = query.Where(p => p.CreatedAt <= endDate);
            }
            // 🔹 Lọc theo năm (nếu có)
            if (Year.HasValue)
            {
                query = query.Where(p => p.CreatedAt.Year == Year.Value);
            }

            // 🔹 Lọc theo tháng (nếu có)
            if (Month.HasValue)
            {
                query = query.Where(p => p.CreatedAt.Month == Month.Value);
            }

            // 🔹 Lọc theo ngày (nếu có)
            if (Day.HasValue)
            {
                query = query.Where(p => p.CreatedAt.Day == Day.Value);
            }
            return await query.ToListAsync();
        }



        public async Task SoftDeletePostAsync(Guid postId)
        {
            // Lấy danh sách các thực thể cần xóa mềm
            var comments = await _context.Comments.Where(c => c.PostId == postId).ToListAsync();
            var likes = await _context.Likes.Where(l => l.PostId == postId).ToListAsync();
            var sharedPosts = await _context.Posts.Where(p => p.OriginalPostId == postId).ToListAsync();

            // Áp dụng xóa mềm
            comments.ForEach(c => c.Delete());
            likes.ForEach(l => l.SoftDelete());
            sharedPosts.ForEach(sp => sp.SoftDelete());
        }

        public async Task<List<Post>> SearchPostsAsync(string keyword)
        {
            return await _context.Posts
                .Where(p => p.Content.Contains(keyword) || p.User != null && p.User.FullName.Contains(keyword))
                .Include(p => p.User) // Lấy thông tin người đăng bài
                .Include(p => p.Comments.Where(c => !c.IsDeleted)) // Chỉ lấy bình luận chưa bị xóa
                    .ThenInclude(c => c.User) // Lấy thông tin người bình luận
                .Include(p => p.Comments)
                    .ThenInclude(c => c.CommentLikes) // Lấy danh sách like của bình luận
                    .ThenInclude(cl => cl.User) // Lấy thông tin người đã like
                .Include(p => p.Likes.Where(l => l.IsLike)) // Lọc chỉ lấy những like hợp lệ
                    .ThenInclude(l => l.User) // Lấy thông tin người đã like
                .Include(p => p.Shares.Where(s => !s.IsDeleted)) // Lọc chỉ lấy những bài đã chia sẻ
                    .ThenInclude(s => s.User) // Lấy thông tin người chia sẻ
                .Include(p => p.OriginalPost) // Lấy bài gốc và các thông tin liên quan
                    .ThenInclude(op => op.User) // Thông tin người đăng bài gốc
                .Include(p => p.OriginalPost)
                    .ThenInclude(op => op.Comments.Where(c => !c.IsDeleted)) // Chỉ lấy comment hợp lệ của bài gốc
                    .ThenInclude(c => c.User)
                .Include(p => p.OriginalPost)
                    .ThenInclude(op => op.Likes.Where(l => l.IsLike)) // Chỉ lấy like hợp lệ của bài gốc
                    .ThenInclude(l => l.User)
                .Include(p => p.OriginalPost)
                    .ThenInclude(op => op.Shares.Where(s => !s.IsDeleted)) // Chỉ lấy share hợp lệ của bài gốc
                    .ThenInclude(s => s.User)
                .ToListAsync();
        }


        public async Task<List<Post>> GetSharedPostAllAsync(Guid originalPostId)
        {
            return await _context.Posts
                        .Where(p => p.OriginalPostId == originalPostId) // Không lọc IsDeleted để đảm bảo lấy tất cả bài chia sẻ
                        .ToListAsync();
        }


        public async Task<Post?> GetByIdOriginalPostAsync(Guid id)
        {
            return await _context.Posts
                .Include(p => p.User)
                .Include(p => p.OriginalPost)
                    .ThenInclude(op => op.User)
                .FirstOrDefaultAsync(p => p.Id == id);
        }

        public async Task<bool> HasUserLikedPostAsync(Guid userId, Guid postId)
        {
            return await _context.Likes
                .AnyAsync(l => l.UserId == userId && l.PostId == postId && l.IsLike);
        }

        public async Task<List<Post>> GetAllPostForSearchAI()
        {
           return await _context.Posts
                .Where(p => !p.IsDeleted && !p.IsApproved == false)
                .ToListAsync();
        }

        public Task<int> GetPostCountAsync(Guid userId)
        {
            return _context.Posts.CountAsync(p => p.UserId == userId);
        }
        public async Task<List<Post>> GetAllPostsWithReportsAsync()
        {
            return await _context.Posts
                .Include(p => p.User)
                .Include(p => p.Reports)
                   .ThenInclude(r => r.ReportedByUser) // Load thông tin người báo cáo
                .Where(p => p.Reports.Any()) // chỉ lấy bài có report
                .ToListAsync();
        }
        public async Task<List<Post>> GetPostImagesByUserAsync(Guid userId)
        {
            return await _context.Posts
                .Where(p => p.UserId == userId &&
                            !string.IsNullOrEmpty(p.ImageUrl) &&
                            !p.IsDeleted &&
                            !p.IsSharedPost &&
                            p.IsApproved)
                .OrderByDescending(p => p.CreatedAt)
                .ToListAsync();
        }
        public async Task<List<Post>> GetTopPostImagesByUserAsync(Guid userId, int count = 3)
        {
            return await _context.Posts
                .Where(p => p.UserId == userId &&
                            !string.IsNullOrEmpty(p.ImageUrl) &&
                            !p.IsDeleted &&
                            !p.IsSharedPost &&
                            p.IsApproved)
                .OrderByDescending(p => p.CreatedAt)
                .Take(count)
                .ToListAsync();
        }
    }
}
