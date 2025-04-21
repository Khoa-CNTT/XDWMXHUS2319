
using Application.DTOs.ChatAI;

namespace Application.CQRS.Commands.ChatAI
{
    public class SendQueryCommand : IRequest<ResponseModel<AIConversationDto>>
    {
        public string Query { get; set; } = string.Empty;
        public Guid UserId { get; set; }
        public Guid? ConversationId { get; set; }
    }
}
