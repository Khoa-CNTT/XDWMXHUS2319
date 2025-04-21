using Application.Interface.ChatAI;

namespace Infrastructure.ChatAI
{
    public class ChatStreamSender : IChatStreamSender
    {
        private readonly IHubContext<ChatHub> _hubContext;

        public ChatStreamSender(IHubContext<ChatHub> hubContext)
        {
            _hubContext = hubContext;
        }

        public Task SendStreamAsync(string sessionId, string data, bool isFinal)
        {
            return _hubContext.Clients.Group(sessionId)
                .SendAsync("ReceiveAnswer", data, isFinal);
        }
    }
}
