

namespace Application.CQRS.Commands.Messages
{
    public class MarkMessageAsSeenCommand : IRequest<ResponseModel<string>>
    {
        public Guid MessageId { get; }
        public Guid ConversationId { get; set; }
        public MarkMessageAsSeenCommand(Guid messageId, Guid conversationId)
        {
            MessageId = messageId;
            ConversationId = conversationId;
        }
    }
}
