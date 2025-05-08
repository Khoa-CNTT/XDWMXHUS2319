

using Application.DTOs.ChatAI;

namespace Application.CQRS.Commands.ChatAI
{
    public class CreateNewConversationAICommandHandler
    : IRequestHandler<CreateNewConversationAICommand, ResponseModel<AIConversationDto>>
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IUserContextService _userContextService;

        public CreateNewConversationAICommandHandler(
            IUnitOfWork unitOfWork,
            IUserContextService userContextService)
        {
            _unitOfWork = unitOfWork;
            _userContextService = userContextService;
        }

        public async Task<ResponseModel<AIConversationDto>> Handle(CreateNewConversationAICommand request, CancellationToken cancellationToken)
        {
            try
            {
                var userId = _userContextService.UserId();
                var conversation = new AIConversation(userId, "Curent Chat");
                await _unitOfWork.AIConversationRepository.AddAsync(conversation);
                await _unitOfWork.SaveChangesAsync();

                var conversationDto = new AIConversationDto
                {
                    ConversationId = conversation.Id,
                    Title = conversation.Title,
                    Messages = new()
                };
                return ResponseFactory.Success(conversationDto, "Conversation created", 200);
            }
            catch (Exception ex)
            {
                return ResponseFactory.Fail<AIConversationDto>(ex.Message, 500);
            }
        }
    }


}
