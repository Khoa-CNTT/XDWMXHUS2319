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
            Console.OutputEncoding = System.Text.Encoding.UTF8;
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
            await Clients.Group(userId.ToString()).SendAsync("ReceiveNotification", message);
        }
        /// <summary>
        /// Gửi thông báo đến chủ bài viết
        /// </summary>
        public async Task SendShareNotification(Guid userId, string message)
        {
            await Clients.User(userId.ToString()).SendAsync("ReceiveNotification", message);
        }
        /// <summary>
        /// Gửi thông báo đến người mình gửi kết bạn
        /// </summary>
        public async Task SendFriendNotification(Guid friendId, string message)
        {
            await Clients.User(friendId.ToString()).SendAsync("ReceiveNotification", message);
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
            var userIdFromContext = _userContextService.UserId();
            Console.WriteLine($"🔗 Client kết nối với ConnectionId: {Context.ConnectionId}, UserId từ context: {userIdFromContext}");

            if (userIdFromContext == Guid.Empty)
            {
                // Yêu cầu UserId từ client nếu context không có
                Console.WriteLine("UserId từ context không hợp lệ, yêu cầu UserId từ client");
                await Clients.Caller.SendAsync("ReceiveUserId");
            }
            else
            {
                await Groups.AddToGroupAsync(Context.ConnectionId, userIdFromContext.ToString());
                Console.WriteLine($"📌 User {userIdFromContext} joined group từ context.");
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
            Console.WriteLine($"Client ngắt kết nối: ConnectionId: {Context.ConnectionId}, UserId: {userId}");
            await base.OnDisconnectedAsync(exception);
        }
        //chat với AI
        public async Task SendMessage(string message)
        {
            var userId = _userContextService.UserId();
            if (userId != Guid.Empty)
            {
                var userName = Context.User?.FindFirst(ClaimTypes.Name)?.Value ?? "User";
                await Clients.Group(userId.ToString()).SendAsync("ReceiveUserMessage", userName, message);
                var aiResponse = await _searchAIService.ProcessChatMessageAsync(message);
                await Clients.Group(userId.ToString()).SendAsync("ReceiveAIMessage", "Huny", aiResponse);
            }
        }
        public async Task SendMessageNotification(Guid userId, string message)
        {
            await Clients.Group(userId.ToString()).SendAsync("ReceiveMessageNotification", message);
        }

        // Nếu cần client gửi userId
        public async Task SetUserId(string userId)
        {
            if (Guid.TryParse(userId, out var parsedUserId) && parsedUserId != Guid.Empty)
            {
                await Groups.AddToGroupAsync(Context.ConnectionId, parsedUserId.ToString());
                Console.WriteLine($"📌 User {parsedUserId} joined group from client.");
            }
        }
    }

}
