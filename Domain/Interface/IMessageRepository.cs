

using static Domain.Common.Enums;

namespace Domain.Interface
{
    public interface IMessageRepository : IBaseRepository<Message>
    {
        Task<List<Message>> GetAllMessageAsync(Guid userId, Guid conversationId);
        //test
        Task<List<Friendship>> GetFriendshipsAsync(Guid userId);
        //
        Task<List<Message>> GetLastMessagesByConversationIdsAsync(List<Guid> conversationIds);
        Task<Dictionary<Guid, int>> GetUnreadCountsByConversationIdsAsync(List<Guid> conversationIds, Guid userId);
        Task<int> GetMessageCountByConversationAsync(Guid conversationId);
        Task<List<Message>> GetMessagesByConversationAsync(
            Guid conversationId,
            int page,
            int pageSize,
            Guid? lastMessageId = null);
        Task<List<Message>> GetLatestMessagesForInboxAsync(Guid userId, Guid? cursorMessageId, int pageSize);
        Task<int> GetUnreadMessageCountAsync(Guid conversationId, Guid userId); // Tách riêng để rõ ràng
        Task<List<Message>> GetMessagesForDeliveryAsync(List<Guid> conversationIds, Guid recipientId);
        Task<Message?> GetMessagesForSeenAsync(Guid messageId, Guid readerId);
        Task<List<Message>> GetListMessagesForSeenAsync(Guid conversationId, Guid senderId);

    }
}
