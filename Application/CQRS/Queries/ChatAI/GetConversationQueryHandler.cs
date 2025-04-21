using Application.DTOs.ChatAI;
using Application.Interface.ChatAI;


namespace Application.CQRS.Queries.ChatAI
{
    public class GetConversationQueryHandler : IRequestHandler<GetConversationQuery, ResponseModel<AIConversationResponseDto>>
    {
        private readonly IConversationService _conversationService;
        private readonly IUserContextService _userContextService;

        public GetConversationQueryHandler(IConversationService conversationService, IUserContextService userContextService)
        {
            _conversationService = conversationService;
            _userContextService = userContextService;
        }

        public async Task<ResponseModel<AIConversationResponseDto>> Handle(GetConversationQuery request, CancellationToken cancellationToken)
        {
            var userId = _userContextService.UserId();

            var result = await _conversationService.GetUserConversationsAsync(userId, request.LastConversationId, 10);

            return ResponseFactory.Success(result, "Lấy danh sách hội thoại AI thành công", 200);
        }
    }

}
