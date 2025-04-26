using Application.Interface.ChatAI;
using StackExchange.Redis;
using System.Text.Json;


namespace Application.Services
{
    public class AIChatService : IAIChatService
    {
        private readonly IPythonApiService _pythonApiService;
        private readonly IConnectionMultiplexer _redis;
        private readonly IUnitOfWork _unitOfWork;
        private readonly IChatStreamSender _chatStreamSender;

        public AIChatService(
            IPythonApiService pythonApiService,
            IConnectionMultiplexer redis,
            IUnitOfWork unitOfWork,
            IChatStreamSender chatStreamSender
            )
        {
            _pythonApiService = pythonApiService;
            _redis = redis;
            _unitOfWork = unitOfWork;
            _chatStreamSender = chatStreamSender;
        }

        public async Task<Guid> SendQueryAsync(Guid userId, string query, Guid conversationId, CancellationToken cancellationToken)
        {
            // Gọi API Python
            await _pythonApiService.SendQueryAsync(query, userId, conversationId, cancellationToken);

            // Subscribe Redis để nhận stream
            var subscriber = _redis.GetSubscriber();
            await subscriber.SubscribeAsync(
                RedisChannel.Literal("answer_stream"),
                async (channel, message) =>
                {
                    var streamData = JsonSerializer.Deserialize<Dictionary<string, object>>(message.ToString());
                    if (streamData == null) return;

                    if (!streamData.TryGetValue("conversation_id", out var convIdObj) ||
                        convIdObj?.ToString() != conversationId.ToString())
                        return;

                    var data = streamData.GetValueOrDefault("data")?.ToString();
                    var isFinal = bool.TryParse(streamData.GetValueOrDefault("is_final")?.ToString(), out var final) && final;

                    if (!string.IsNullOrEmpty(data))
                    {
                        await _chatStreamSender.SendStreamAsync(
                            conversationId.ToString(),
                            data,
                            isFinal
                        );
                    }

                    // Lưu lịch sử chat khi hoàn tất
                    if (isFinal)
                    {
                        var chatQuery = streamData.GetValueOrDefault("query")?.ToString();
                        var answer = streamData.GetValueOrDefault("answer")?.ToString();
                        var tokenStr = streamData.GetValueOrDefault("token_count")?.ToString();

                        if (!string.IsNullOrWhiteSpace(chatQuery) &&
                            !string.IsNullOrWhiteSpace(answer) &&
                            int.TryParse(tokenStr, out int tokenCount))
                        {
                        }
                    }
                });

            return conversationId;
        }


       
    }
}
