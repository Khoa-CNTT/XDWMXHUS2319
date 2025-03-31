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


        /// <summary>
        /// Gửi thông báo chung đến tất cả người dùng
        /// </summary>
        public async Task SendNotification(string message)
        {
            await Clients.All.SendAsync("ReceiveNotification", message);
        }
        
        /// <summary>
        /// Gửi cảnh báo đến một tài xế cụ thể
        /// </summary>
        public async Task SendAlertToUser(Guid userId, string message)
        {
            await Clients.Group(userId.ToString()).SendAsync("ReceiveAlert", message);
        }
        /// <summary>
        /// Gửi thông báo đến chủ bài viết
        /// </summary>
        public async Task SendShareNotification(Guid userId, string message)
        {
            await Clients.User(userId.ToString()).SendAsync("ReceiveNotification", message);
        }
        /// <summary>
        /// Gửi thông báo trong ứng dụng đến một tài xế cụ thể
        /// </summary>
        public async Task SendInAppNotificationToUser(Guid userId, string message)
        {
            await Clients.Group(userId.ToString()).SendAsync("ReceiveNotification", message);
        }

        /// <summary>
        /// Khi người dùng kết nối, thêm vào group dựa trên userId
        /// </summary>

        public override async Task OnConnectedAsync()
        {
            var userId = _userContextService.UserId();
            Console.WriteLine($"🔗 User {userId} đã kết nối với SignalR");
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
