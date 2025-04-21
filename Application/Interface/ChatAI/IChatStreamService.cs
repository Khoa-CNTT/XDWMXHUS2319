

namespace Application.Interface.ChatAI
{
    public interface IChatStreamService
    {
        Task ProcessStreamMessageAsync(Guid conversationId, Guid userId, string data, bool isFinal, string query, string answer, int tokenCount);
    }
}
