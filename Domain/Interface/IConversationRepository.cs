using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Domain.Interface
{
    public interface IConversationRepository :IBaseRepository<Conversation>
    {
        Task<Conversation?> GetConversationAsync(Guid userId1, Guid userId2);
        Task<List<Conversation>> GetAllConversationsAsync(Guid userId);
    }   
}
