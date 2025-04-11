
namespace Application.CQRS.Commands.Messages
{
    public class GetOrCreateConversationCommandHandler : IRequestHandler<GetOrCreateConversationCommand, ResponseModel<GetOrCreateConversationResponseDto>>
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IUserContextService _userContextService;

        public GetOrCreateConversationCommandHandler(
            IUnitOfWork unitOfWork,
            IUserContextService userContextService)
        {
            _unitOfWork = unitOfWork;
            _userContextService = userContextService;
        }

        public async Task<ResponseModel<GetOrCreateConversationResponseDto>> Handle(GetOrCreateConversationCommand request, CancellationToken cancellationToken)
        {
            var user1Id = _userContextService.UserId();
            var user2Id = request.User2Id;
            var (minId, maxId) = user1Id.CompareTo(user2Id) < 0 ? (user1Id, user2Id) : (user2Id, user1Id);

            var conversation = await _unitOfWork.ConversationRepository.GetConversationAsync(user1Id, request.User2Id);
            if (conversation == null)
            {
                conversation = new Conversation(minId, maxId); // Đảm bảo User1Id < User2Id
                await _unitOfWork.ConversationRepository.AddAsync(conversation);
                await _unitOfWork.SaveChangesAsync();
            }
            
            var result = new GetOrCreateConversationResponseDto
                {
                    Id = conversation.Id
                };

            return ResponseFactory.Success(
                result,
                "Lấy hoặc tạo cuộc trò chuyện thành công.",
                200
            );
        }
    }
}
