using Application.DTOs.Message;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.CQRS.Queries.Messages
{
    public class GetMessagesQueries : IRequest<ResponseModel<GetMessagesResponseDto>>
    {
        public Guid ConversationId { get; set; }
        public Guid? NextCursor { get; set; } = Guid.Empty;

    }

}
