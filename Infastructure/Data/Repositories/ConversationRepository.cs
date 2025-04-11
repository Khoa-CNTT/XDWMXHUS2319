


using Microsoft.EntityFrameworkCore;
using System.Linq.Expressions;

namespace Infrastructure.Data.Repositories
{
    public class ConversationRepository : BaseRepository<Conversation>, IConversationRepository
    {
        public ConversationRepository(AppDbContext context) : base(context)
        {
        }
        // Tìm cuộc trò chuyện giữa hai người dùng (không tạo trùng)
        public async Task<Conversation?> GetConversationAsync(Guid userId1, Guid userId2)
        {
            var (minId, maxId) = userId1.CompareTo(userId2) < 0 ? (userId1, userId2) : (userId2, userId1);
            return await _context.Conversations
                .FirstOrDefaultAsync(c => c.User1Id == minId && c.User2Id == maxId);
        }

        
        public override Task<bool> DeleteAsync(Guid id)
        {
            throw new NotImplementedException();
        }

        public async Task<List<Conversation>> GetAllConversationsAsync(Guid userId)
        {
            return await _context.Conversations
                .Where(c => c.User1Id == userId || c.User2Id == userId)
                .ToListAsync();
        }
        public async Task<List<Conversation>> GetManyAsync(Expression<Func<Conversation, bool>> predicate)
        {
            return await _context.Conversations
                .AsNoTracking()
                .Where(predicate)
                .ToListAsync();
        }
    }
    
}
