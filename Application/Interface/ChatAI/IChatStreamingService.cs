

using System.Runtime.CompilerServices;

namespace Application.Interface.ChatAI
{
    public interface IChatStreamingService
    {
        // Removed [EnumeratorCancellation] attribute as it has no effect in this context
        IAsyncEnumerable<string> StreamQueryAsync(string query, string userId, string conversationId, string accessToken, CancellationToken cancellationToken);
    }
}
