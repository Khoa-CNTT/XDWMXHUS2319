using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Domain.Interface
{
    public interface IAIChatHistoryRepository : IBaseRepository<AIChatHistory>
    {
        Task<List<AIChatHistory>> GetHistoriesByConversationId(Guid conversationId, Guid? lastMessageId, int pageSize);
        Task<List<AIChatHistory>> GetHistoriesByConversationId(Guid conversationId);
        Task DeleteRangeAsync(IEnumerable<Guid> ids);
    }
}
