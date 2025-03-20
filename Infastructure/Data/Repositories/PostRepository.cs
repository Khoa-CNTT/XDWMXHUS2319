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

        public async Task<List<Post>> GetAllPostsAsync(CancellationToken cancellationToken)
        {
            return await _context.Posts
                 .Include(p => p.User)         // Lấy thông tin người đăng bài

                 .Include(p => p.Comments.Where(c => !c.IsDeleted)) // Chỉ lấy bình luận chưa bị xóa
                    .ThenInclude(c => c.User) // Lấy thông tin người bình luận
                .Include(p => p.Comments.Where(c => !c.IsDeleted)) // Lấy tất cả bình luận
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
                    .Where(p => !p.IsDeleted)
                 .ToListAsync(cancellationToken);
        }

        public async Task<IEnumerable<Post>> GetPostsByTypeAsync(PostTypeEnum postTypeEnum)
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
                .Where(p => p.PostType == postTypeEnum)
                .ToListAsync();
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
                   .Where(p => p.OriginalPostId == originalPostId && !p.IsDeleted)
                   .ToListAsync();
        }

        public async Task<Guid> GetPostOwnerIdAsync(Guid postId)
        {
            return await _context.Posts
                .Where(p => p.Id == postId) // ✅ Lọc bài viết theo ID
                .Select(p => p.UserId) // ✅ Lấy OwnerId (chủ sở hữu)
                .FirstOrDefaultAsync(); // ✅ Lấy giá trị đầu tiên (hoặc null nếu không có)

        }
    }
}
