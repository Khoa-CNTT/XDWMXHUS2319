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
    }
}
