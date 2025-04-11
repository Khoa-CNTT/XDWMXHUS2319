using Application.DTOs.Message;
using Microsoft.AspNetCore.SignalR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;

namespace Infrastructure.Hubs
{
    public class ChatHub : Hub
    {
        private readonly IRedisService _redisService;
        private readonly IUnitOfWork _unitOfWork;
        private readonly TimeSpan _statusExpiration = TimeSpan.FromMinutes(5);
        public ChatHub(IRedisService redisService, IUnitOfWork unitOfWork)
        {
            _redisService = redisService;
            _unitOfWork = unitOfWork;
        }
        public override async Task OnConnectedAsync()
        {
            var userId = Context.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId)) return;

            // Thêm connectionId vào danh sách kết nối
            await _redisService.AddAsync($"user_connections:{userId}", Context.ConnectionId);
            // Cập nhật trạng thái online
            await _redisService.SaveDataAsync($"user_status:{userId}", "online", _statusExpiration);
            // Gửi sự kiện UserOnline tới tất cả client
            await Clients.All.SendAsync("UserOnline", userId);

            // Gửi danh sách user đã online cho client vừa kết nối
            var onlineUsers = await GetOnlineUsers();
            await Clients.Caller.SendAsync("InitialOnlineUsers", onlineUsers);

            await base.OnConnectedAsync();
        }

        public override async Task OnDisconnectedAsync(Exception? exception)
        {
            var userId = Context.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId)) return;

            // Xóa connectionId khỏi danh sách
            await _redisService.RemoveItemFromListAsync<string>($"user_connections:{userId}", Context.ConnectionId);

            // Kiểm tra danh sách kết nối
            var connections = await _redisService.GetListAsync<string>($"user_connections:{userId}");
            if (connections == null || !connections.Any())
            {
                // Không còn kết nối, đánh dấu offline
                await _redisService.SaveDataAsync($"user_last_seen:{userId}", DateTime.UtcNow.ToString("o"), TimeSpan.FromHours(24));
                await _redisService.RemoveDataAsync($"user_status:{userId}");
                await _redisService.RemoveDataAsync($"user_connections:{userId}");
                await Clients.All.SendAsync("UserOffline", userId);
            }

            await base.OnDisconnectedAsync(exception);
        }

        // Helper để lấy danh sách user online
        private async Task<List<string>> GetOnlineUsers()
        {
            var allKeys = await _redisService.GetKeysAsync("user_status:*");
            var onlineUsers = new List<string>();
            foreach (var key in allKeys)
            {
                var userId = key.Split(':')[1];
                var status = await _redisService.GetDataAsync<string>(key);
                if (status == "online")
                {
                    onlineUsers.Add(userId);
                }
            }
            return onlineUsers;
        }
        public async Task JoinConversation(string conversationId)
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, conversationId);
        }

        public async Task LeaveConversation(string conversationId)
        {
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, conversationId);
        }

        public async Task SendMessageToConversation(string conversationId, MessageDto message)
        {
            await Clients.Group(conversationId).SendAsync("ReceiveMessage", message);
        }

        // Giữ mã MarkMessageAsSeen cũ của bạn hoặc dùng mã tôi đề xuất
        public async Task MarkMessageAsSeen(string conversationId, string messageId)
        {
            await Clients.Group(conversationId).SendAsync("MessageSeen", messageId);
        }

        public async Task SendTyping(string conversationId)
        {
            var userId = Context.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            await Clients.OthersInGroup(conversationId).SendAsync("UserTyping", userId);
        }
    }
}
