using Application.DTOs.Message;
using Application.Interface.ContextSerivce;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.CQRS.Queries.Messages
{
    public class GetMessagesQueriesHandler : IRequestHandler<GetMessagesQueries, ResponseModel<GetMessagesResponseDto>>
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMessageService _messageService;
        private readonly IUserContextService _userContextService;

        public GetMessagesQueriesHandler(IUnitOfWork unitOfWork, IUserContextService userContextService,IMessageService messageService)
        {
            _unitOfWork = unitOfWork;
            _userContextService = userContextService;
            _messageService = messageService;
        }

        public async Task<ResponseModel<GetMessagesResponseDto>> Handle(GetMessagesQueries request, CancellationToken cancellationToken)
        {
            var userId = _userContextService.UserId();
            var conversation = await _unitOfWork.ConversationRepository.GetByIdAsync(request.ConversationId);

            if (conversation == null || (conversation.User1Id != userId && conversation.User2Id != userId))
            {
                return ResponseFactory.Fail<GetMessagesResponseDto>("Cuộc trò chuyện không tồn tại hoặc bạn không có quyền truy cập.", 404);
            }

            var totalCount = await _unitOfWork.MessageRepository
                .GetMessageCountByConversationAsync(request.ConversationId);

            // Lấy tin nhắn kèm theo nextCursor
            var messageListDto = await _messageService.GetMessagesAsync(
                request.ConversationId,
                userId,
                request.NextCursor
            );

            var response = new GetMessagesResponseDto
            {
                Messages = messageListDto.Messages,
                TotalCount = totalCount,
                NextCursor = messageListDto.NextCursor
            };

            return ResponseFactory.Success(response, "Lấy danh sách tin nhắn thành công.", 200);
        }
    }
}
