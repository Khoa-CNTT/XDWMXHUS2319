using Application.CQRS.Commands.ChatAI;
using Application.DTOs.ChatAI;
using Application.Interface.ChatAI;
using MediatR;
using Microsoft.Extensions.Logging;
using System.Runtime.CompilerServices;


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

        public async IAsyncEnumerable<string> StreamQueryAsync(string query, string userId, string conversationId, string accessToken, [EnumeratorCancellation] CancellationToken cancellationToken)
        {
            // Kiểm tra xác thực
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

            // Kiểm tra conversation
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

            // Lấy chat history
            var histories = await _unitOfWork.AIChatHistoryRepository.GetHistoriesByConversationId(conversationGuid);
            var chatHistory = histories.OrderByDescending(h => h.Timestamp).Take(5).Select(h => new AIChatHistoryDto
            {
                Id = h.Id,
                Query = h.Query ?? string.Empty,
                Answer = h.Answer ?? string.Empty,
                Timestamp = h.Timestamp
            }).ToList();

            // Gọi Python API
            _logger.LogDebug("Sending query to Python API with token: {Token}", accessToken);
            var pythonResponse = await _pythonApiService.SendQueryAsync(
                query,
                jwtUserId,
                conversationGuid,
                _userContextService.Role(),
                chatHistory,
                accessToken,
                cancellationToken
            );

            // Lưu lịch sử chat
            var command = new StoreChatHistoryCommand
            {
                ConversationId = conversationGuid,
                UserId = jwtUserId,
                Query = query,
                Answer = pythonResponse.Answer,
                TokenCount = pythonResponse.Metadata.TokenCount
            };
            await _mediator.Send(command, cancellationToken);

            // Gửi các chunk với độ trễ để tạo hiệu ứng typing
            var words = pythonResponse.Answer.Split(' ', StringSplitOptions.RemoveEmptyEntries);
            for (int i = 0; i < words.Length; i++)
            {
                yield return words[i] + (i < words.Length - 1 ? " " : "");
                _logger.LogDebug("Streaming chunk: {Chunk}", words[i]);
                await Task.Delay(100, cancellationToken); // Độ trễ 100ms giữa các từ
            }
        }
    }
}