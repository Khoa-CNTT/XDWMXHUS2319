

using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Data.Repositories
{
    public class AIChatHistoryRepository : BaseRepository<AIChatHistory>, IAIChatHistoryRepository
    {
        public AIChatHistoryRepository(AppDbContext context) : base(context)
        {
        }
        public override Task<bool> DeleteAsync(Guid id)
        {
            throw new NotImplementedException();
        }

        public async Task<List<AIChatHistory>> GetHistoriesByConversationId(Guid conversationId, Guid? lastMessageId, int pageSize)
        {
            const int MAX_PAGE_SIZE = 50;
            pageSize = Math.Min(pageSize, MAX_PAGE_SIZE);

            var query = _context.AIChatHistories
                .Where(ch => ch.ConversationId == conversationId)
                .AsQueryable();

            if (lastMessageId.HasValue)
            {
                var lastMessage = await _context.AIChatHistories.FindAsync(lastMessageId.Value);
                if (lastMessage != null)
                {
                    query = query.Where(ch => ch.Timestamp < lastMessage.Timestamp);
                }
            }

            return await query
                .OrderBy(ch => ch.Timestamp)
                .Take(pageSize)
                .ToListAsync();
        }

        public async Task DeleteRangeAsync(IEnumerable<Guid> ids)
        {
            var histories = await _context.AIChatHistories
                .Where(ch => ids.Contains(ch.Id))
                .ToListAsync();
            _context.AIChatHistories.RemoveRange(histories);
        }

        public async Task<List<AIChatHistory>> GetHistoriesByConversationId(Guid conversationId)
        {
            var query = _context.AIChatHistories
                .Where(ch => ch.ConversationId == conversationId)
                .AsQueryable();
            return await query
                .OrderBy(ch => ch.Timestamp)
                .ToListAsync();
        }
    }

}
