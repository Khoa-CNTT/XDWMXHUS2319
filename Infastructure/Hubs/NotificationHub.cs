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
            var userIdFromContext = _userContextService.UserId();
            var userIdFromClient = Context.Items["UserId"]?.ToString();
            var userId = !string.IsNullOrEmpty(userIdFromClient) ? userIdFromClient : userIdFromContext.ToString();

            if (!string.IsNullOrEmpty(userId) && userId != Guid.Empty.ToString())
            {
                await Groups.RemoveFromGroupAsync(Context.ConnectionId, userId);
                Console.WriteLine($"❌ User {userId} left group.");
            }
            Console.WriteLine($"Client ngắt kết nối: ConnectionId: {Context.ConnectionId}, UserId: {userId}");
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
        public async Task SendNewMessageNotification(Guid receiverId, string senderId, string content, string messageId)
        {
            var message = new
            {
                SenderId = senderId,
                Content = content,
                MessageId = messageId
            };
            Console.WriteLine($"Gửi SignalR tới UserId: {receiverId}: {Newtonsoft.Json.JsonConvert.SerializeObject(message)}");
            await Clients.Group(receiverId.ToString()).SendAsync("ReceiveMessageNotification", message);
        }


    }

}
