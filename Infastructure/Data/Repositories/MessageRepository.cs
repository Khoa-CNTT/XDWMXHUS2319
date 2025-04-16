

using Domain.Entities;
using Domain.Interface;
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
        public async Task<List<Message>> GetLatestMessagesForInboxAsync(Guid userId, Guid? cursorMessageId, int itemsToFetch)
        {
            // --- 1. Lấy thông tin của tin nhắn cursor ---
            bool cursorIsUnreadPriority = false; // Ưu tiên 0 = Unread, Ưu tiên 1 = Read/Sent
            DateTime? cursorSentAt = null;

            if (cursorMessageId.HasValue && cursorMessageId.Value != Guid.Empty)
            {
                // Lấy các trường cần thiết của cursor message để xác định vị trí của nó trong thứ tự sắp xếp
                var cursorMessageInfo = await _context.Messages
                    .Where(m => m.Id == cursorMessageId.Value)
                    .Select(m => new
                    {
                        m.SentAt,
                        IsUnreadForUser = m.SenderId != userId && !m.IsSeen // Xác định trạng thái ưu tiên
                    })
                    .FirstOrDefaultAsync();

                if (cursorMessageInfo != null)
                {
                    cursorSentAt = cursorMessageInfo.SentAt;
                    cursorIsUnreadPriority = cursorMessageInfo.IsUnreadForUser; // true nếu là Unread (ưu tiên 0)
                }
                else
                {
                    // Xử lý nếu cursor không hợp lệ? Có thể bỏ qua cursor hoặc ném lỗi.
                    // Ở đây chúng ta sẽ bỏ qua cursor nếu không tìm thấy.
                    cursorSentAt = null;
                    cursorMessageId = null;
                }
            }

            // --- 2. Subquery lấy ID tin nhắn mới nhất mỗi cuộc hội thoại (Giữ nguyên) ---
            var latestMessageIdsQuery = _context.Messages
                .Where(m => m.Conversation.User1Id == userId || m.Conversation.User2Id == userId)
                .GroupBy(m => m.ConversationId)
                .Select(g => g.OrderByDescending(msg => msg.SentAt).Select(msg => msg.Id).FirstOrDefault());

            // --- 3. Query cơ sở lấy các tin nhắn mới nhất ---
            var query = _context.Messages
                .Where(m => latestMessageIdsQuery.Contains(m.Id));

            // --- 4. Áp dụng bộ lọc cursor PHỨC TẠP ---
            if (cursorSentAt.HasValue) // Chỉ áp dụng nếu có cursor hợp lệ
            {
                query = query.Where(m =>
                    // Logic: Tìm các item 'm' đứng SAU cursor trong thứ tự sắp xếp
                    // Thứ tự sắp xếp: Ưu tiên (Unread=0, Read=1) ASC, SentAt DESC

                    // Điều kiện 1: Ưu tiên của 'm' cao hơn cursor (m là Read/Sent=1, cursor là Unread=0)
                    (!(m.SenderId != userId && !m.IsSeen) && cursorIsUnreadPriority)
                    ||
                    // Điều kiện 2: Ưu tiên bằng nhau VÀ SentAt của 'm' nhỏ hơn (cũ hơn) SentAt của cursor
                    (((m.SenderId != userId && !m.IsSeen) == cursorIsUnreadPriority) && m.SentAt < cursorSentAt.Value)
                );
            }

            // --- 5. Include dữ liệu liên quan ---
            // Cần include User1, User2 để xác định otherUser trong Service
            // Include Sender có thể cần nếu FE muốn hiển thị "You: ..."
            IQueryable<Message> queryWithIncludes = query // Gán vào biến mới để rõ ràng hơn
                        .Include(m => m.Conversation) // Include Conversation
                            .ThenInclude(c => c.User1) // Include User1 từ Conversation đó
                        .Include(m => m.Conversation) // Bắt đầu đường dẫn Include mới từ Message->Conversation
                            .ThenInclude(c => c.User2) // Include User2 từ Conversation đó
                        .Include(m => m.Sender); // Include Sender từ Message

            // --- 6. Áp dụng SẮP XẾP ---
            // Phải khớp chính xác với logic dùng để lọc cursor
            query = queryWithIncludes
                // Ưu tiên 1: Tin nhắn chưa đọc (Unread = true -> Priority 0)
                .OrderBy(m => (m.SenderId != userId && !m.IsSeen) ? 0 : 1) // Sắp xếp theo Ưu tiên TĂNG DẦN (0 trước 1)
                                                                           // Ưu tiên 2: Thời gian gửi giảm dần trong mỗi nhóm ưu tiên
                .ThenByDescending(m => m.SentAt);

            // --- 7. Lấy số lượng yêu cầu và thực thi ---
            return await query
                .Take(itemsToFetch) // Lấy pageSize + 1 items
                .ToListAsync();
        }
        public async Task<int> GetUnreadMessageCountAsync(Guid conversationId, Guid userId)
        {
            return await _context.Messages
                .CountAsync(m => m.ConversationId == conversationId && // Thuộc cuộc hội thoại
                                 m.SenderId != userId && !m.IsSeen       // Gửi bởi người khác
                                 );                          // Chưa được xem bởi người nhận (userId)
        }
        public async Task<List<Message>> GetMessagesForDeliveryAsync(List<Guid> conversationIds, Guid recipientId)
        {
            return await _context.Messages
                .Where(m => conversationIds.Contains(m.ConversationId) &&
                           m.SenderId != recipientId &&
                           m.Status == MessageStatus.Sent)
                .ToListAsync();
        }

        public async Task<Message?> GetMessagesForSeenAsync(Guid messageId, Guid readerId)
        {
            return await _context.Messages
                .Where(m => m.Id == messageId &&
                           m.SenderId != readerId &&
                           (m.Status == MessageStatus.Sent || m.Status == MessageStatus.Delivered))
                .FirstOrDefaultAsync();
        }
        public async Task<List<Message>> GetListMessagesAsync(Guid messageId, Guid senderId, MessageStatus targetStatus)
        {
            // Truy vấn chính với join
            var query = from m in _context.Messages.AsNoTracking()
                        join target in _context.Messages.AsNoTracking()
                            on m.ConversationId equals target.ConversationId
                        where target.Id == messageId &&
                              m.SenderId != senderId &&
                              m.SentAt <= target.SentAt
                        select m;

            if (targetStatus == MessageStatus.Seen)
            {
                query = query.Where(m => m.Status == MessageStatus.Sent || m.Status == MessageStatus.Delivered);
            }
            else if (targetStatus == MessageStatus.Delivered)
            {
                query = query.Where(m => m.Status == MessageStatus.Sent);
            }

            var messages = await query.ToListAsync();

            // Kiểm tra targetMessage tồn tại
            if (!await _context.Messages.AnyAsync(m => m.Id == messageId))
            {
                return new List<Message>();
            }

            return messages;
        }


    }

}
