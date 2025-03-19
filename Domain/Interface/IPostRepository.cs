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
        Task<Guid> GetPostOwnerIdAsync(Guid id);
    }
}
