using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Infrastructure.Data.Repositories
{
    public class RefreshtokenRepository : BaseRepository<RefreshToken>, IRefreshtokenRepository
    {
        public RefreshtokenRepository(AppDbContext context) : base(context)
        {
        }

        public override Task<bool> DeleteAsync(Guid id)
        {
            throw new NotImplementedException();
        }

        public override Task<RefreshToken?> GetByIdAsync(Guid id)
        {
            throw new NotImplementedException();
        }

        public async Task<RefreshToken?> GetByTokenAsync(string token)
        {
            return await _context.RefreshTokens.SingleOrDefaultAsync(x => x.Token == token);
        }
    }
}
