using Application.DTOs.ChatAI;
using Application.Interface.ChatAI;
using Microsoft.Extensions.Logging;
using System.Text.Json;

namespace Application.CQRS.Commands.ChatAI
{
    public class SendQueryHandler : IRequestHandler<SendQueryCommand, ResponseModel<AIConversationDto>>
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IUserContextService _userContextService;
        private readonly IPythonApiService _pythonApiService;
        private readonly IMediator _mediator;
        private readonly ILogger<SendQueryHandler> _logger;

        public SendQueryHandler(
            IUnitOfWork unitOfWork,
            IUserContextService userContextService,
            IPythonApiService pythonApiService,
            IMediator mediator,
            ILogger<SendQueryHandler> logger)
        {
            _unitOfWork = unitOfWork ?? throw new ArgumentNullException(nameof(unitOfWork));
            _userContextService = userContextService ?? throw new ArgumentNullException(nameof(userContextService));
            _pythonApiService = pythonApiService ?? throw new ArgumentNullException(nameof(pythonApiService));
            _mediator = mediator ?? throw new ArgumentNullException(nameof(mediator));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        public async Task<ResponseModel<AIConversationDto>> Handle(SendQueryCommand request, CancellationToken cancellationToken)
        {
            try
            {
                var userId = _userContextService.UserId();
                _logger.LogInformation("Processing query: {Query}, UserId: {UserId}, ConversationId: {ConversationId}",
                    request.Query, userId, request.ConversationId);

                // Tạo hoặc lấy hội thoại
                AIConversation conversation;
                if (request.ConversationId.HasValue)
                {
                    conversation = await _unitOfWork.AIConversationRepository.GetByIdAsync(request.ConversationId.Value)
                        ?? throw new InvalidOperationException("Conversation not found");
                    if (conversation.UserId != userId)
                    {
                        _logger.LogWarning("Unauthorized access to conversation {ConversationId} by UserId {UserId}",
                            request.ConversationId, userId);
                        return ResponseFactory.Fail<AIConversationDto>("Conversation not found or unauthorized", 404);
                    }
                }
                else
                {
                    var title = string.Join(" ", request.Query.Split(' ').Take(5));
                    conversation = new AIConversation(userId, title);
                    await _unitOfWork.AIConversationRepository.AddAsync(conversation);
                    await _unitOfWork.SaveChangesAsync();
                    _logger.LogInformation("Created new conversation: {ConversationId}", conversation.Id);
                }
                // Gửi truy vấn tới Python
                //var pythonResponse = await _pythonApiService.SendQueryAsync(
                //    request.Query,
                //    userId,
                //    conversation.Id,
                //    _userContextService.Role(),
                //    _userContextService.AccessToken(),
                //    cancellationToken
                //);

                // Trả về thông tin hội thoại
                var conversationDto = MapToDto(conversation);
                return ResponseFactory.Success(conversationDto, "Query sent", 200);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error processing query: {Query}", request.Query);
                return ResponseFactory.Fail<AIConversationDto>(ex.Message, 500);
            }
        }

        private AIConversationDto MapToDto(AIConversation conversation)
        {
            return new AIConversationDto
            {
                ConversationId = conversation.Id,
                Title = conversation.Title ?? string.Empty,
                Messages = conversation.ChatHistories.Select(h => new AIChatHistoryDto
                {
                    Id = h.Id,
                    Query = h.Query ?? string.Empty,
                    Answer = h.Answer ?? string.Empty,
                    Timestamp = h.Timestamp
                }).OrderBy(m => m.Timestamp).ToList()
            };
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