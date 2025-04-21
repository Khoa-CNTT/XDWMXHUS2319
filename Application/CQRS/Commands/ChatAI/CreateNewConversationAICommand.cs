using Application.DTOs.ChatAI;


namespace Application.CQRS.Commands.ChatAI
{
    public class CreateNewConversationAICommand : IRequest<ResponseModel<AIConversationDto>>
    {
        public Guid UserId { get; set; }
        public string Title { get; set; } = "New Chat";
    }
}
