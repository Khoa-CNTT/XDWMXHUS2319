

using Application.DTOs.ChatAI;
using Application.Interface.ChatAI;

namespace Application.CQRS.Queries.ChatAI
{
    public class GetChatHistoryQureiesHandler : IRequestHandler<GetChatHistoryQureies, ResponseModel<AIChatHistoryResponseDto>>
    {
        private readonly IConversationService _conversationService;
        private readonly IUserContextService _userContextService;
        public GetChatHistoryQureiesHandler(IConversationService conversationService, IUserContextService userContextService)
        {
            _conversationService = conversationService;
            _userContextService = userContextService;
        }
        public async Task<ResponseModel<AIChatHistoryResponseDto>> Handle(GetChatHistoryQureies request, CancellationToken cancellationToken)
        {
            var userId = _userContextService.UserId();

            var result = await _conversationService.GetChatHistories(request.ConversationId, request.LastConversationId, 10);

            return ResponseFactory.Success(result, "Lấy danh sách hội thoại AI thành công", 200);


        }
    }

}
