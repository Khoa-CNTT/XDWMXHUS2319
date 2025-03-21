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
        private readonly AppDbContext _context;

        public PostRepository(AppDbContext context) : base(context)
        {
            _context = context;
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

            const int MAX_PAGE_SIZE = 50;
            pageSize = Math.Min(pageSize, MAX_PAGE_SIZE);

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
                 .Where(p => !p.IsDeleted) // Chỉ lấy bài chưa bị xóa
                 .OrderByDescending(p => p.CreatedAt); // Sắp xếp bài mới nhất lên trước

            // Nếu có LastPostId, chỉ lấy bài viết cũ hơn nó
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
                .Take(pageSize)
                .ToListAsync(cancellationToken);
        }

        public async Task<List<Post>> GetPostsByTypeAsync(PostTypeEnum postType, Guid? lastPostId, int pageSize, CancellationToken cancellationToken)
        {
            const int MAX_PAGE_SIZE = 50;
            pageSize = Math.Min(pageSize, MAX_PAGE_SIZE);

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
                .Where(p => !p.IsDeleted && p.PostType == postType) // Chỉ lấy bài chưa bị xóa và có loại đúng
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
                .Take(pageSize)
                .ToListAsync(cancellationToken);
        }

        //timkiem nguoi dung(dangg)
        public async Task<List<Post>> SearchPostsAsync(string keyword, DateTime? fromDate, DateTime? toDate, int? Year, int? Month, int? Day)
        {
            var query = _context.Posts
         .Include(p => p.User)
         .Include(p => p.Comments.Where(c => !c.IsDeleted))
             .ThenInclude(c => c.User)
         .Include(p => p.Likes.Where(l => l.IsLike)) // Sửa lỗi chỗ này
             .ThenInclude(l => l.User)
         .Include(p => p.Shares.Where(s => !s.IsDeleted))
             .ThenInclude(s => s.User)
        .Where(p => p.Content.Contains(keyword) || p.User.FullName.Contains(keyword));

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
            var comments = _context.Comments.Where(c => c.PostId == postId);
            var likes = _context.Likes.Where(l => l.PostId == postId);
            // Tìm tất cả bài viết chia sẻ bài gốc
            var sharedPosts = _context.Posts.Where(p => p.OriginalPostId == postId);

            foreach (var comment in comments) comment.Delete();
            foreach (var like in likes) like.SoftDelete();
            foreach (var sharedPost in sharedPosts) sharedPost.SoftDelete();
        }

        public async Task<List<Post>> SearchPostsAsync(string keyword)
        {
            return await _context.Posts
                 .Include(p => p.User)         // Lấy thông tin người đăng bài
                 .Include(p => p.Comments.Where(c => !c.IsDeleted)) // Chỉ lấy bình luận chưa bị xóa
                    .ThenInclude(c => c.User) // Lấy thông tin người bình luận
                .Include(p => p.Comments) // Lấy tất cả bình luận
                    .ThenInclude(c => c.CommentLikes) // Lấy danh sách người đã like bình luận
                        .ThenInclude(cl => cl.User) // Lấy thông tin người đã like
                 .Include(p => p.Likes.Where(l => !l.IsLike)) // Lấy những người thích bài viết đã like nếu like = false thì k lấy
                     .ThenInclude(l => l.User) //  Thêm Include(User) vào đây
                 .Include(p => p.Shares.Where(s => !s.IsDeleted)) //Lấy những bài viết đã chia sẻ nếu đã xóa chia sẻ thì k lấy
                     .ThenInclude(s => s.User) // Lấy thông tin người chia sẻ
                 .Include(p => p.OriginalPost) // Load bài gốc
                    .ThenInclude(op => op.Comments) // Load comments của bài gốc
                    .ThenInclude(c => c.User)
                .Include(p => p.OriginalPost)
                    .ThenInclude(op => op.Likes) // Load likes của bài gốc
                    .ThenInclude(l => l.User)
                .Include(p => p.OriginalPost)
                    .ThenInclude(op => op.Shares) // Load shares của bài gốc
                    .ThenInclude(s => s.User)
                .Where(p => p.Content.Contains(keyword) || p.User.FullName.Contains(keyword))
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
                .Include(p => p.OriginalPost)
                .ThenInclude(op => op.User)
                .FirstOrDefaultAsync(p => p.Id == id);
        }

        public async Task<List<Post>> GetPostsByOwnerAsync(Guid userId, Guid? lastPostId, int pageSize, CancellationToken cancellationToken)
        {
            var query = _context.Posts
               .Include(p => p.User)
               .Include(p => p.Likes.Where(l => l.IsLike))
               .Include(p => p.Comments.Where(c => !c.IsDeleted))
               .Include(p => p.Shares.Where(s => !s.IsDeleted))
               .Include(p => p.OriginalPost)
                   .ThenInclude(op => op.User)
               .Where(p => p.UserId == userId && !p.IsDeleted);

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
                .Take(pageSize)
                .ToListAsync(cancellationToken);
        }
    }
}
