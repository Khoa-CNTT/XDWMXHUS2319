using Application.Interface.ContextSerivce;
using Microsoft.AspNetCore.SignalR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;

namespace Infrastructure.Hubs
{
    using Microsoft.AspNetCore.SignalR;
    using System;
    using System.Threading.Tasks;

    public class NotificationHub : Hub
    {
        private readonly IUserContextService _userContextService;

        public NotificationHub(IUserContextService userContextService)
        {
            _userContextService = userContextService;
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

        /// <summary>
        /// Khi người dùng ngắt kết nối, xóa khỏi group
        /// </summary>
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
    }

}
