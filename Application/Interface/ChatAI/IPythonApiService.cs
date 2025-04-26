using Application.DTOs.ChatAI;


namespace Application.Interface.ChatAI
{
    public interface IPythonApiService
    {
        Task<PythonApiResponse> SendQueryAsync(string query, Guid userId, Guid conversationId, string role, List<AIChatHistoryDto> chatHistory, string accessToken, CancellationToken cancellationToken);
    }
}
