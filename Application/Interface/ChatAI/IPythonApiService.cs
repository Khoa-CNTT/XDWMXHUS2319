using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Interface.ChatAI
{
    public interface IPythonApiService
    {
        Task SendQueryAsync(string query, Guid userId, Guid conversationId, CancellationToken cancellationToken);
    }
}
