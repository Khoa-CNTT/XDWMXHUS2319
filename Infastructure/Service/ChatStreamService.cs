using Application.DTOs.ChatAI;
using Application.Interface.ChatAI;
using Domain.Entities;
using MediatR;
using Microsoft.Extensions.Logging;
using System.Runtime.CompilerServices;
using System.Text.Json;

namespace Infrastructure.Service
{

    public class ChatStreamingService : IChatStreamingService
    {
        private readonly IPythonApiService _pythonApiService;
        private readonly IUserContextService _userContextService;
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMediator _mediator;
        private readonly ILogger<ChatStreamingService> _logger;

        public ChatStreamingService(
            IPythonApiService pythonApiService,
            IUserContextService userContextService,
            IUnitOfWork unitOfWork,
            IMediator mediator,
            ILogger<ChatStreamingService> logger)
        {
            _pythonApiService = pythonApiService ?? throw new ArgumentNullException(nameof(pythonApiService));
            _userContextService = userContextService ?? throw new ArgumentNullException(nameof(userContextService));
            _unitOfWork = unitOfWork ?? throw new ArgumentNullException(nameof(unitOfWork));
            _mediator = mediator ?? throw new ArgumentNullException(nameof(mediator));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        public async IAsyncEnumerable<(string Type, object Content)> StreamQueryAsync(
            string query,
            string userId,
            string conversationId,
            string accessToken,
            string streamId,
            [EnumeratorCancellation] CancellationToken cancellationToken)
        {
            if (!_userContextService.IsAuthenticated())
            {
                _logger.LogWarning("User not authenticated");
                throw new UnauthorizedAccessException("User not authenticated");
            }

            Guid jwtUserId = _userContextService.UserId();
            if (userId != jwtUserId.ToString())
            {
                _logger.LogWarning("User ID {UserId} does not match JWT {JwtUserId}", userId, jwtUserId);
                throw new UnauthorizedAccessException("User ID does not match JWT");
            }

            if (!Guid.TryParse(conversationId, out Guid conversationGuid))
            {
                _logger.LogWarning("Invalid conversation ID: {ConversationId}", conversationId);
                throw new ArgumentException("Invalid conversation ID");
            }

            var conversation = await _unitOfWork.AIConversationRepository.GetByIdAsync(conversationGuid);
            if (conversation == null || conversation.UserId != jwtUserId)
            {
                _logger.LogWarning("Conversation {ConversationId} not found or unauthorized for UserId {UserId}", conversationId, userId);
                throw new UnauthorizedAccessException("Conversation not found or unauthorized");
            }

            // Stream chunks từ Python API
            await foreach (var (type, content) in _pythonApiService.SendQueryAsync(
                query, jwtUserId, conversationGuid, _userContextService.Role(), accessToken, streamId, cancellationToken))
            {
                if (type == "chunk")
                {
                    var chunk = content.ToString() ?? "";
                    _logger.LogDebug("Streaming chunk: {Chunk}, StreamId: {StreamId}", chunk, streamId);
                    yield return ("chunk", chunk);
                }
                else if (type == "complete")
                {
                    var results = (List<Dictionary<string, object>>)content;
                    var firstResult = results.FirstOrDefault();

                    if (firstResult == null)
                    {
                        _logger.LogWarning("No result data received in 'complete' response.");
                        yield return ("error", "Empty result set received.");
                        yield break;
                    }

                    var normalizedQuery = firstResult.GetValueOrDefault("normalized_query")?.ToString();
                    var answer = firstResult.GetValueOrDefault("answer")?.ToString()?.Trim();
                    var redisKey = firstResult.GetValueOrDefault("redis_key")?.ToString();

                    _logger.LogInformation("Received complete data: Query={Query}, RedisKey={RedisKey}, StreamId={StreamId}", normalizedQuery, redisKey, streamId);
                    Guid? chatHistoryId = null;
                    if (!string.IsNullOrWhiteSpace(answer) && !ErrorResponses.Contains(answer))
                    {
                        var contextJson = JsonSerializer.Serialize(results, new JsonSerializerOptions
                        {
                            WriteIndented = true,
                            Encoder = System.Text.Encodings.Web.JavaScriptEncoder.UnsafeRelaxedJsonEscaping
                        });

                        _logger.LogDebug("Saving contextJson: {ContextJson}", contextJson);

                        var aiChatHistory = new AIChatHistory(
                            conversation.Id,
                            normalizedQuery ?? query,
                            answer,
                            tokenCount: 0, // Bạn có thể lấy tokenCount từ firstResult nếu có
                            contextJson,
                            type: firstResult.GetValueOrDefault("action_type")?.ToString() ?? ""
                        );
                         
                        await _unitOfWork.AIChatHistoryRepository.AddAsync(aiChatHistory);
                        await _unitOfWork.SaveChangesAsync();
                        chatHistoryId = aiChatHistory.Id;
                        _logger.LogInformation("Saved chat history for conversation: {ConversationId}, StreamId: {StreamId}", conversation.Id, streamId);
                    }

                    yield return ("complete", new
                    {
                        Results = results,
                        ChatHistoryId = chatHistoryId?.ToString() // Chuyển Guid thành string
                    });
                }
                else if (type == "final")
                {
                    var pythonResponse = (PythonApiResponse)content;
                    // Lưu lịch sử chat
                    if (!ErrorResponses.Contains(pythonResponse.Answer.Trim()))
                    {
                        var contextJson = JsonSerializer.Serialize(pythonResponse.Results, new JsonSerializerOptions
                        {
                            WriteIndented = true,
                            Encoder = System.Text.Encodings.Web.JavaScriptEncoder.UnsafeRelaxedJsonEscaping
                        });

                        _logger.LogDebug("Saving contextJson: {ContextJson}", contextJson);

                        var aiChatHistory = new AIChatHistory(
                            conversation.Id,
                            pythonResponse.NormalizedQuery,
                            pythonResponse.Answer,
                            pythonResponse.TokenCount,
                            contextJson,
                            pythonResponse.Type
                        );

                        await _unitOfWork.AIChatHistoryRepository.AddAsync(aiChatHistory);
                        await _unitOfWork.SaveChangesAsync();
                        _logger.LogInformation("Saved chat history for conversation: {ConversationId}, StreamId: {StreamId}", conversation.Id, streamId);
                    }
                    else
                    {
                        _logger.LogWarning("Skipping chat history save due to error response: {Answer}, StreamId: {StreamId}", pythonResponse.Answer, streamId);
                    }
                    yield return ("final", pythonResponse.Answer ?? "Không có nội dung trả lời.");
                }
            }
        }

        private static readonly HashSet<string> ErrorResponses = new HashSet<string>
        {
            "Không tìm thấy thông tin phù hợp.",
            "Hệ thống bận, vui lòng thử lại sau.",
            "Câu hỏi không hợp lệ.",
            "ID người dùng không hợp lệ.",
            "Truy vấn quá dài, vui lòng rút ngắn.",
            "Đã xảy ra lỗi khi xử lý yêu cầu."
        };
    }
}