using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Text;
using System.Threading.Tasks;

namespace Domain.Interface
{
    public interface IUserScoreHistoriesRepository : IBaseRepository<UserScoreHistory>
    {
        Task<bool> AnyAsync(Expression<Func<UserScoreHistory, bool>> predicate);
        Task<List<UserScoreHistory>> GetTrustScoreHistoriesCursorAsync(Guid userId, DateTime? cursor, int take, CancellationToken cancellationToken);
    }
}
