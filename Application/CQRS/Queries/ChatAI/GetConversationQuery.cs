using Application.DTOs.ChatAI;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.CQRS.Queries.ChatAI
{
    public class GetConversationQuery : IRequest<ResponseModel<AIConversationResponseDto>>
    {
        public Guid? LastConversationId { get; set; }
        public GetConversationQuery(Guid? lastConversationId)
        {
            LastConversationId = lastConversationId;
        }
    }

}
