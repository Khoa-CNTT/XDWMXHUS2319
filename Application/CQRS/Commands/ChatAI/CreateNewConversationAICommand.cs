using Application.DTOs.ChatAI;


namespace Application.CQRS.Commands.ChatAI
{
    public class CreateNewConversationAICommand : IRequest<ResponseModel<AIConversationDto>>
    {
    }
}
