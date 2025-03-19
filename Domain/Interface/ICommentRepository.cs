using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Text;
using System.Threading.Tasks;

namespace Domain.Interface
{
    public interface ICommentRepository : IBaseRepository<Comment>
    {
        Task<IEnumerable<Comment>> GetCommentByPostIdAsync(Guid postId);
        Task<int> CountPostCommentAsync(Expression<Func<Comment, bool>> predicate);
    }
}
