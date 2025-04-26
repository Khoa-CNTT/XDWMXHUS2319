using Application.DTOs.ChatAI;
using Application.Interface.ChatAI;


namespace Application.Services
{
    public class ConversationService : IConversationService
    {
        private readonly IUnitOfWork _unitOfWork;
        public ConversationService(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }
        public async Task<AIConversationResponseDto> GetUserConversationsAsync(Guid userId, Guid? lastConversationId, int pageSize)
        {
            var conversations = await _unitOfWork.AIConversationRepository
                .GetConversationsByUserId(userId, lastConversationId, pageSize);

            var dto = new AIConversationResponseDto
            {
                Conversations = conversations
                    .Select(c => new AIConversationDto
                    {
                        ConversationId = c.Id,
                        Title = c.Title
                    })
                    .ToList()
            };

            // Gán NextCursor nếu còn nhiều dữ liệu
            if (conversations.Count == pageSize)
            {
                dto.NextCursor = conversations.Last().Id;
            }

            return dto;
        }
        public async Task<AIChatHistoryResponseDto> GetChatHistories(Guid conversationId, Guid? lastMessageId, int pageSize)
        {
            try
            {
                var histories = await _unitOfWork.AIChatHistoryRepository.GetHistoriesByConversationId(conversationId, lastMessageId, pageSize);

                var dto = new AIChatHistoryResponseDto
                {
                    ChatHistories = histories.Select(h => new AIChatHistoryDto
                    {
                        Id = h.Id,
                        Query = h.Query,
                        Answer = h.Answer,
                        Timestamp = h.Timestamp
                    }).ToList()
                };

                if (histories.Count == pageSize)
                {
                    dto.NextCursor = histories.Last().Id;
                }

                return dto;
            }
            catch (Exception ex)
            {
                // Log exception
                throw new Exception("Error fetching chat histories", ex);

            }
        }
    }
}
