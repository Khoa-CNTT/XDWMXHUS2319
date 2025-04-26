using Application.DTOs.ChatAI;
using Application.Interface.ChatAI;
using Microsoft.Extensions.Logging;

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
                _logger.LogInformation("Processing query: {Query}, UserId: {UserId}, ConversationId: {ConversationId}",
                    request.Query, request.UserId, request.ConversationId);

                // Tạo hoặc lấy hội thoại
                AIConversation conversation;
                if (request.ConversationId.HasValue)
                {
                    conversation = await _unitOfWork.AIConversationRepository.GetByIdAsync(request.ConversationId.Value)
                        ?? throw new InvalidOperationException("Conversation not found");
                    if (conversation.UserId != request.UserId)
                    {
                        _logger.LogWarning("Unauthorized access to conversation {ConversationId} by UserId {UserId}",
                            request.ConversationId, request.UserId);
                        return ResponseFactory.Fail<AIConversationDto>("Conversation not found or unauthorized", 404);
                    }
                }
                else
                {
                    var title = string.Join(" ", request.Query.Split(' ').Take(5));
                    conversation = new AIConversation(request.UserId, title);
                    await _unitOfWork.AIConversationRepository.AddAsync(conversation);
                    await _unitOfWork.SaveChangesAsync();
                    _logger.LogInformation("Created new conversation: {ConversationId}", conversation.Id);
                }

                // Lấy chat history
                var histories = await _unitOfWork.AIChatHistoryRepository.GetHistoriesByConversationId(conversation.Id);
                var chat_history = histories.OrderByDescending(h => h.Timestamp).Take(5).Select(h => new AIChatHistoryDto
                {
                    Id = h.Id,
                    Query = h.Query ?? string.Empty,
                    Answer = h.Answer ?? string.Empty,
                    Timestamp = h.Timestamp
                }).ToList();

                // Gửi truy vấn tới Python
                var pythonResponse = await _pythonApiService.SendQueryAsync(
                    request.Query,
                    request.UserId,
                    conversation.Id,
                    _userContextService.Role(), 
                    chat_history,
                    _userContextService.AccessToken(),
                    cancellationToken
                );

                // Lưu lịch sử chat
                var command = new StoreChatHistoryCommand
                {
                    ConversationId = conversation.Id,
                    UserId = request.UserId,
                    Query = request.Query,
                    Answer = pythonResponse.Answer,
                    TokenCount = pythonResponse.Metadata.TokenCount
                };
                await _mediator.Send(command);
                _logger.LogInformation("Saved chat history for conversation: {ConversationId}", conversation.Id);

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
    }
}