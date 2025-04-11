using Application.DTOs.Message;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.CQRS.Queries.Messages
{
    public class GetConversationsQueries : IRequest<ResponseModel<GetConversationsResponseDto>>
    {
      
    }
}
