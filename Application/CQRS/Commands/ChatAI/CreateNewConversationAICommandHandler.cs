

using Application.DTOs.ChatAI;

namespace Application.CQRS.Commands.ChatAI
{
    public class CreateNewConversationAICommandHandler
    : IRequestHandler<CreateNewConversationAICommand, ResponseModel<AIConversationDto>>
    {
        private readonly IUnitOfWork _unitOfWork;

        public CreateNewConversationAICommandHandler(
            IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public async Task<ResponseModel<AIConversationDto>> Handle(CreateNewConversationAICommand request, CancellationToken cancellationToken)
        {
            try
            {
                var conversation = new AIConversation(request.UserId, request.Title);
                await _unitOfWork.AIConversationRepository.AddAsync(conversation);
                await _unitOfWork.SaveChangesAsync();

                var conversationDto = new AIConversationDto
                {
                    ConversationId = conversation.Id,
                    Title = conversation.Title,
                    Messages = new()
                };
                return ResponseFactory.Success(conversationDto, "Conversation created", 201);
            }
            catch (Exception ex)
            {
                return ResponseFactory.Fail<AIConversationDto>(ex.Message, 500);
            }
        }
    }


}
