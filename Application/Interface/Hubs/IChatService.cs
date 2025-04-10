using Application.DTOs.Message;


namespace Application.Interface.Hubs
{
    public interface IChatService
    {
        Task SendMessageAsync(MessageDto message, Guid recipientId);
        Task MarkMessageAsSeenAsync(Guid conversationId, Guid messageId);
    }
}
