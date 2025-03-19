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
        Task<IEnumerable<Share>> GetSharesByPostIdAsync(Guid postId);
        Task<int> CountPostShareAsync(Expression<Func<Share, bool>> predicate);
        Task<List<Share>> SearchSharesAsync(string keyword);
    }
}
