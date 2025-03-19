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
        Task<IEnumerable<Post>> GetPostsByTypeAsync(PostTypeEnum postType);

        Task<List<Post>> GetAllPostsAsync(CancellationToken cancellationToken);
        //xoa mem
      
        Task SoftDeletePostAsync(Guid postId);
        // ✅ Thêm phương thức tìm kiếm bài viết(dangg)
        Task<List<Post>> SearchPostsAsync(string keyword, DateTime? fromDate, DateTime? toDate,int? Year, int? Month,int? Day);
    }
}
