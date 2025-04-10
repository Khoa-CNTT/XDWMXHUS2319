using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

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
