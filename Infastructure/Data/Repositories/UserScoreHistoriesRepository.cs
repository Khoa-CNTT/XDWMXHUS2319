using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Text;
using System.Threading.Tasks;

namespace Infrastructure.Data.Repositories
{
    public class UserScoreHistoriesRepository : BaseRepository<UserScoreHistory>, IUserScoreHistoriesRepository
    {
        public UserScoreHistoriesRepository(AppDbContext context) : base(context)
        {
        }
        public async Task<bool> AnyAsync(Expression<Func<UserScoreHistory, bool>> predicate)
        {
            return await _dbSet.AnyAsync(predicate);
        }
        public override Task<bool> DeleteAsync(Guid id)
        {
            throw new NotImplementedException();
        }
        public async Task<List<UserScoreHistory>> GetTrustScoreHistoriesCursorAsync(
           Guid userId,
           DateTime? cursor,
           int take,
           CancellationToken cancellationToken)
        {
            var query = _dbSet
                .Where(ush => ush.UserId == userId);

            if (cursor.HasValue)
            {
                query = query.Where(ush => ush.CreatedAt < cursor.Value);
            }

            return await query
                .OrderByDescending(ush => ush.CreatedAt)
                .Take(take + 1)
                .ToListAsync(cancellationToken);
        }
    }
}
