using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using static Domain.Common.Enums;

namespace Domain.Interface
{
    public interface IPostRepository : IBaseRepository<Post>
    {
        Task<IEnumerable<Post>> GetPostsByApprovalStatusAsync(ApprovalStatusEnum approvalStatusEnum);
        Task<List<Post>> GetPostsByTypeAsync(PostTypeEnum postType, Guid? lastPostId, int pageSize, CancellationToken cancellationToken);

        Task<List<Post>> SearchPostsAsync(string keyword);

        Task<List<Post>> GetAllPostsAsync(Guid? lastPostId, int pageSize, CancellationToken cancellationToken);

        //xoa mem
      
        Task SoftDeletePostAsync(Guid postId);
        // ✅ Thêm phương thức tìm kiếm bài viết(dangg)
        Task<List<Post>> SearchPostsAsync(string keyword, DateTime? fromDate, DateTime? toDate,int? Year, int? Month,int? Day);


        Task<List<Post>> GetSharedPostAllAsync(Guid originalPostId);

        Task<List<Post>> GetPostsByOwnerAsync(Guid userId, Guid? lastPostId, int pageSize, CancellationToken cancellationToken);
        Task<Post?> GetByIdOriginalPostAsync(Guid id);
        Task<Guid> GetPostOwnerIdAsync(Guid postId);

        Task<List<Post>> GetAllPostForSearchAI();
        Task<int> GetPostCountAsync(Guid userId);

    }
}
