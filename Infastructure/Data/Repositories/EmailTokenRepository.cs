using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Infrastructure.Data.Repositories
{
    public class EmailTokenRepository : BaseRepository<EmailVerificationToken>, IEmailTokenRepository
    {
        public EmailTokenRepository(AppDbContext context) : base(context)
        {
        }

        public override async Task<bool> DeleteAsync(Guid id)
        {
            var entity = await _dbSet.FirstOrDefaultAsync(x => x.Id == id);
            if (entity == null)
            {
                return false;
            }
            _dbSet.Remove(entity);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<EmailVerificationToken?> GetByTokenAsync(string token)
        {
            return await _context.emailVerificationTokens.FirstOrDefaultAsync(x => x.Token == token);
        }
    }
}
