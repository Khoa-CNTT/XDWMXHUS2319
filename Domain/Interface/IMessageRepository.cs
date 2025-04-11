

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
        //AddRangeAsync
    }
}
