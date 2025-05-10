using Application.DTOs.ChatAI;
using System.Runtime.CompilerServices;


namespace Application.Interface.ChatAI
{
    public interface IPythonApiService
    {
        IAsyncEnumerable<(string Type, object Content)> SendQueryAsync(
            string query,
            Guid userId,
            Guid conversationId,
            string role,
            string accessToken,
            string streamId,
             CancellationToken cancellationToken);
    }
}
