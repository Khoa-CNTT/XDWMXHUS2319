using Application.Interface.ContextSerivce;
using Application.Interface.SearchAI;
using Infrastructure.Service;
using Microsoft.AspNetCore.SignalR;
using System.Security.Claims;


namespace Infrastructure.Hubs
{


    public class NotificationHub : Hub
    {
        private readonly IUserContextService _userContextService;
        private readonly ISearchAIService _searchAIService;

        public NotificationHub(IUserContextService userContextService, ISearchAIService searchAIService)
        {
            _userContextService = userContextService;
            _searchAIService = searchAIService;
        }

        public override async Task OnConnectedAsync()
        {
            var userId = _userContextService.UserId();
            if (userId != Guid.Empty)
            {
                await Groups.AddToGroupAsync(Context.ConnectionId, userId.ToString());
                Console.WriteLine($"📌 User {userId} joined group.");
            }
            await base.OnConnectedAsync();
        }

        public override async Task OnDisconnectedAsync(Exception? exception)
        {
            var userId = _userContextService.UserId();
            if (userId != Guid.Empty)
            {
                await Groups.RemoveFromGroupAsync(Context.ConnectionId, userId.ToString());
                Console.WriteLine($"❌ User {userId} left group.");
            }
            await base.OnDisconnectedAsync(exception);
        }

        public async Task SendMessage(string message)
        {
            var userId = _userContextService.UserId();
            if (userId != Guid.Empty)
            {
                var userName = Context.User?.FindFirst(ClaimTypes.Name)?.Value ?? "User";
                await Clients.Group(userId.ToString()).SendAsync("ReceiveMessage", userName, message, true);
                var aiResponse = await _searchAIService.ProcessChatMessageAsync(message);
                await Clients.Group(userId.ToString()).SendAsync("ReceiveMessage", "Huny", aiResponse, false);
            }
        }

       
    }

}
