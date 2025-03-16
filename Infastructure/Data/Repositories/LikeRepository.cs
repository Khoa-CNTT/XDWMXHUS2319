using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Infrastructure.Data.Repositories
{
    public class LikeRepository : BaseRepository<Like>, ILikeRepository
    {
        public LikeRepository(AppDbContext context) : base(context)
        {
        }

        public async Task AddRangeAsync(IEnumerable<Like> entities)
        {
            //viết logic thêm nhiều like vào db
            await _context.AddRangeAsync(entities);
        }

        public override Task<bool> DeleteAsync(Guid id)
        {
            throw new NotImplementedException();
        }

        public override Task<Like?> GetByIdAsync(Guid id)
        {
            throw new NotImplementedException();
        }
    }
}
