using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Infrastructure.Data.Repositories
{
    public class UserRepository : BaseRepository<User>, IUserRepository
    {
        public UserRepository(AppDbContext context) : base(context)
        {
        }

        public override Task<bool> DeleteAsync(Guid id)
        {
            throw new NotImplementedException();
        }

       

        public async Task<bool> GetExsitsEmailAsync(string email)
        {
            return await _context.Users.AnyAsync(x => x.Email == email);
        }

        public async Task<User?> GetUserByEmailAsync(string email)
        {
           return await _context.Users.FirstOrDefaultAsync(x => x.Email == email);
        }

        public async Task<List<User>> SearchUsersAsync(string keyword)
        {

            return await _context.Users
            .Where(u => u.FullName.Contains(keyword) || u.Email.Contains(keyword))
            .ToListAsync();

            

        }
    }
}
