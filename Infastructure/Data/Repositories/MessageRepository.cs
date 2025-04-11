

using Domain.Entities;
using static Domain.Common.Enums;

namespace Infrastructure.Data.Repositories
{
    public class MessageRepository : BaseRepository<Message>, IMessageRepository
    {
        public MessageRepository(AppDbContext context) : base(context)
        {
        }

        public override async Task<bool> DeleteAsync(Guid id)
        {
            var message = await _context.Messages.FindAsync(id);
            if (message == null) return false;

            _context.Messages.Remove(message);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<List<Message>> GetAllMessageAsync(Guid userId,Guid conversationId)
        {
            return await _context.Messages
                .Where(m => m.ConversationId == conversationId &&
                                !m.IsSeen &&
                                m.SenderId != userId)
                .OrderByDescending(m => m.SentAt)
                .ToListAsync();
        }

        public async Task<List<Friendship>> GetFriendshipsAsync(Guid userId)
        {
            return await _context.Friendships
                .Where(f =>
                    f.Status == FriendshipStatusEnum.Accepted &&
                    (f.UserId == userId || f.FriendId == userId))
                .ToListAsync();
        }



        public async Task<List<Message>> GetLastMessagesByConversationIdsAsync(List<Guid> conversationIds)
        {
            return await _context.Messages
                .Where(m => conversationIds.Contains(m.ConversationId))
                .GroupBy(m => m.ConversationId)
                .Select(g => g.OrderByDescending(m => m.SentAt).First())
                .ToListAsync();
        }

        public async Task<Dictionary<Guid, int>> GetUnreadCountsByConversationIdsAsync(List<Guid> conversationIds, Guid userId)
        {
            return await _context.Messages
                .Where(m => conversationIds.Contains(m.ConversationId) && !m.IsSeen && m.SenderId != userId)
                .GroupBy(m => m.ConversationId)
                .Select(g => new { ConversationId = g.Key, Count = g.Count() })
                .ToDictionaryAsync(x => x.ConversationId, x => x.Count);
        }

        public async Task<int> GetMessageCountByConversationAsync(Guid conversationId)
        {
            return await _context.Messages
                .CountAsync(m => m.ConversationId == conversationId);
        }

        public async Task<List<Message>> GetMessagesByConversationAsync(
    Guid conversationId,
    int page,
    int pageSize,
    Guid? lastMessageId = null)
        {
            const int MAX_PAGE_SIZE = 50;
            pageSize = Math.Min(pageSize, MAX_PAGE_SIZE);

            var query = _context.Messages
                .Include(m => m.Sender)
                .Where(m => m.ConversationId == conversationId);

            if (lastMessageId.HasValue)
            {
                var lastMessage = await _context.Messages.FindAsync(lastMessageId.Value);
                if (lastMessage != null)
                {
                    // Load thêm tin nhắn cũ hơn
                    query = query.Where(m => m.SentAt < lastMessage.SentAt);
                }
            }

            // Sắp xếp theo thứ tự mới nhất → cũ nhất
            query = query.OrderByDescending(m => m.SentAt);

            // Phân trang nếu cần
            if (!lastMessageId.HasValue)
            {
                query = query.Skip((page - 1) * pageSize);
            }

            // Lấy dữ liệu rồi đảo lại thứ tự: từ cũ đến mới (hiển thị đúng)
            var messages = await query.Take(pageSize).ToListAsync();
            messages.Reverse(); // Để hiện từ cũ đến mới

            return messages;
        }

    }

}
