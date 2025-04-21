namespace Infrastructure.Hubs
{
    public class AIHub : Hub
    {
        public async Task JoinConversation(string conversationId)
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, conversationId);
        }

        public async Task LeaveConversation(string conversationId)
        {
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, conversationId);
        }

        public async Task StreamAnswer(string conversationId, string userId, string data, bool final)
        {
            await Clients.Group(conversationId).SendAsync("ReceiveAnswer", new
            {
                ConversationId = conversationId,
                UserId = userId,
                Data = data,
                Final = final
            });
        }
    }
}
