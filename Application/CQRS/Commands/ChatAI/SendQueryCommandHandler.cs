using Application.DTOs.ChatAI;
using Application.Interface.ChatAI;
using Infrastructure.ModelChatAI;
using Microsoft.AspNetCore.SignalR;
using StackExchange.Redis;
using System.Text.Json;

namespace Application.CQRS.Commands.ChatAI
{
    public class SendQueryHandler : IRequestHandler<SendQueryCommand, ResponseModel<AIConversationDto>>
    {
        private readonly IAIChatService _aiChatService;
        private readonly IUnitOfWork _unitOfWork;
        private readonly IUserContextService _userContextService;
        private readonly IPythonApiService _pythonApiService;

        public SendQueryHandler(
            IAIChatService aiChatService,
            IUnitOfWork unitOfWork,
            IUserContextService userContextService,
            IPythonApiService pythonApiService)
        {
            _aiChatService = aiChatService;
            _unitOfWork = unitOfWork;
            _userContextService = userContextService;
            _pythonApiService = pythonApiService;
        }

        public async Task<ResponseModel<AIConversationDto>> Handle(SendQueryCommand request, CancellationToken cancellationToken)
        {
            try
            {
                // Tạo hoặc lấy hội thoại
                AIConversation? conversation;
                if (request.ConversationId.HasValue)
                {
                    conversation = await _unitOfWork.AIConversationRepository.GetByIdAsync(request.ConversationId.Value);
                    if (conversation == null || conversation.UserId != request.UserId)
                        return ResponseFactory.Fail<AIConversationDto>("Conversation not found or unauthorized", 404);
                }
                else
                {
                    var title = string.Join(" ", request.Query.Split(' ').Take(5));
                    conversation = new AIConversation(request.UserId, title);
                    await _unitOfWork.AIConversationRepository.AddAsync(conversation);
                    await _unitOfWork.SaveChangesAsync();
                }

                // Gửi truy vấn tới Python và bắt đầu streaming
                await _pythonApiService.SendQueryAsync(request.Query, request.UserId, conversation.Id, cancellationToken);

                // Trả về thông tin hội thoại
                var conversationDto = MapToDto(conversation);
                return ResponseFactory.Success(conversationDto, "Query sent", 200);
            }
            catch (Exception ex)
            {
                return ResponseFactory.Fail<AIConversationDto>(ex.Message, 500);
            }
        }

        private AIConversationDto MapToDto(AIConversation conversation)
        {
            return new AIConversationDto
            {
                ConversationId = conversation.Id,
                Title = conversation.Title,
                Messages = conversation.ChatHistories.Select(h => new AIChatHistoryDto
                {
                    Id = h.Id,
                    Query = h.Query,
                    Answer = h.Answer,
                    Timestamp = h.Timestamp
                }).OrderBy(m => m.Timestamp).ToList()
            };
        }
    }
}
