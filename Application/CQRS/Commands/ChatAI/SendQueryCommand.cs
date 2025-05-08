
using Application.DTOs.ChatAI;

namespace Application.CQRS.Commands.ChatAI
{
    public class SendQueryCommand : IRequest<ResponseModel<AIConversationDto>>
    {
        public required string Query { get; set; }
        public Guid? ConversationId { get; set; }
    }
}
