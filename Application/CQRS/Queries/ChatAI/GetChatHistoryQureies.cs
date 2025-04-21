using Application.DTOs.ChatAI;

namespace Application.CQRS.Queries.ChatAI
{
    public class GetChatHistoryQureies : IRequest<ResponseModel<AIChatHistoryResponseDto>>
    {
        public Guid ConversationId { get; set; }
        public Guid? LastConversationId { get; set; }

        public GetChatHistoryQureies(Guid? lastConversationId, Guid conversationId)
        {
            LastConversationId = lastConversationId;
            ConversationId = conversationId;
        }
    }
   
}
