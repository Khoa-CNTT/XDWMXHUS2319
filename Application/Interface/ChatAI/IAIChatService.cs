using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Interface.ChatAI
{
    public interface IAIChatService
    {
        Task<Guid> SendQueryAsync(Guid userId, string query, Guid conversationId, CancellationToken cancellationToken);
    }
}
