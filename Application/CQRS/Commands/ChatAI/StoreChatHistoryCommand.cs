
namespace Application.CQRS.Commands.ChatAI
{
    public class StoreChatHistoryCommand : IRequest<ResponseModel<bool>>
    {
        public Guid ConversationId { get; set; }
        public Guid UserId { get; set; }
        public string Query { get; set; } = string.Empty;
        public string Answer { get; set; } = string.Empty;
        public int TokenCount { get; set; }
    }
}
