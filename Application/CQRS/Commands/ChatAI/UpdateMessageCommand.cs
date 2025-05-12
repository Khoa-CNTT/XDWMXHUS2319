

namespace Application.CQRS.Commands.ChatAI
{
    public class UpdateMessageCommand : IRequest<ResponseModel<bool>>
    {
        public Guid ChatHistoryId { get; set; } // Thay StreamId bằng ChatHistoryId
        public string? SuccessMessage { get; set; }
        public string? RedisKey { get; set; } = string.Empty; // Thay StreamId bằng ChatHistoryId
    }
}
