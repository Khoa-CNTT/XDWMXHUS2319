using Application.DTOs.Message;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.CQRS.Queries.Messages
{
    public class GetConversationsQueriesHandler : IRequestHandler<GetConversationsQueries, ResponseModel<GetConversationsResponseDto>>
    {
        private readonly IMessageService _messageService;

        public GetConversationsQueriesHandler(IMessageService messageService)
        {
            _messageService = messageService;
        }

        public async Task<ResponseModel<GetConversationsResponseDto>> Handle(GetConversationsQueries request, CancellationToken cancellationToken)
        {
            var conversationDtos = await _messageService.GetConversationsAsync();

            // Luôn trả về danh sách, có thể là rỗng
            var response = new GetConversationsResponseDto
            {
                Conversations = conversationDtos
            };

            return ResponseFactory.Success(response, "Lấy danh sách cuộc trò chuyện thành công", 200);
        }
    }

}
