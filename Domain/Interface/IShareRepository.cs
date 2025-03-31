using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Text;
using System.Threading.Tasks;

namespace Domain.Interface
{
    public interface IShareRepository : IBaseRepository<Share>
    {
        Task<int> CountPostShareAsync(Expression<Func<Share, bool>> predicate);
        Task<List<Share>> SearchSharesAsync(string keyword);
        Task<List<Share>> GetSharesByPostIdAsync(Guid postId, int page, int pageSize);
        Task<List<Post>> GetSharedPostAllDeleteAsync(Guid originalPostId);

        Task<int> GetShareCountAsync(Guid userId);

        Task<List<Share>> GetSharesByPostIdAsync(Guid postId);
        Task<List<Share>> GetSharedUsersByPostIdWithCursorAsync(Guid postId, Guid? lastUserId, int pageSize, CancellationToken cancellationToken);


    }
}
