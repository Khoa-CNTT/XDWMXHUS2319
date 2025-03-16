using Domain.Common;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using static Domain.Common.Enums;

namespace Infrastructure.Data.Repositories
{
    public class PostRepository :BaseRepository<Post> ,IPostRepository
    {
        public PostRepository(AppDbContext context) : base(context)
        {
        }

        public override Task<bool> DeleteAsync(Guid id)
        {
            throw new NotImplementedException();
        }

        public override Task<Post?> GetByIdAsync(Guid id)
        {
            throw new NotImplementedException();
        }

        public async Task<IEnumerable<Post>> GetPostsByApprovalStatusAsync(ApprovalStatusEnum approvalStatusEnum)
        {
            return await _context.Posts
                .Where(x => x.ApprovalStatus == approvalStatusEnum )
                .ToListAsync();
        }
    }
}
