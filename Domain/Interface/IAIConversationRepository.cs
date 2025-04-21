

namespace Domain.Interface
{
    public interface IAIConversationRepository : IBaseRepository<AIConversation>
    {
        Task<AIConversation?> GetConversationByUserId(Guid id);
        Task<List<AIConversation>> GetConversationsByUserId(Guid userId, Guid? lastConversationId, int pageSize);
        Task<AIConversation?> GetByIdAsync(Guid? id);
    }
}
