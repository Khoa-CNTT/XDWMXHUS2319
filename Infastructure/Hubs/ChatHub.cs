using System.Security.Claims;
namespace Infrastructure.Hubs
{
    //class dùng để thực hiện chức năng chat signal người với người,và phát hiện trạng thái online
    public class ChatHub : Hub
    {

        private readonly IRedisService _redisService;
        private readonly IUnitOfWork _unitOfWork;
        private readonly TimeSpan _statusExpiration = TimeSpan.FromMinutes(15);
        private readonly IMessageStatusService _messageStatusService;
        public ChatHub(IRedisService redisService, IUnitOfWork unitOfWork, IMessageStatusService messageStatusService)
        {
            _redisService = redisService;
            _unitOfWork = unitOfWork;
            _messageStatusService = messageStatusService;
            Console.OutputEncoding = System.Text.Encoding.UTF8;
        }
        public override async Task OnConnectedAsync()
        {
            var userIdString = Context.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdString) || !Guid.TryParse(userIdString, out var userId) || userId == Guid.Empty)
            {
                Context.Abort();
                Console.WriteLine("UserId không hợp lệ trong OnConnectedAsync, abort kết nối");
                return;
            }

            Console.WriteLine($"🔗 Client kết nối: ConnectionId: {Context.ConnectionId}, UserId: {userId}");
            await Groups.AddToGroupAsync(Context.ConnectionId, userId.ToString());
            await _redisService.AddAsync($"user_connections:{userId}", Context.ConnectionId);
            await _redisService.SaveDataAsync($"user_status:{userId}", "online", TimeSpan.FromSeconds(30)); // Timeout 30 giây

            var friends = await _redisService.GetFriendsAsync(userId.ToString());
            if (!friends.Any())
            {
                await _redisService.SyncFriendsToRedis(userId.ToString());
                friends = await _redisService.GetFriendsAsync(userId.ToString());
            }

            Console.WriteLine($"Gửi userOnline cho bạn bè của {userId}: {string.Join(", ", friends)}");
            foreach (var friendIdStr in friends)
            {
                if (Guid.TryParse(friendIdStr, out var friendId) && friendId != userId)
                {
                    await Clients.Group(friendId.ToString()).SendAsync("userOnline", userId.ToString());
                    Console.WriteLine($"📤 Đã gửi userOnline đến {friendId}");
                }
            }

            var onlineUsers = await GetOnlineUsers();
            await Clients.Caller.SendAsync("initialOnlineUsers", onlineUsers);
            Console.WriteLine($"Gửi initialOnlineUsers cho {userId}: {string.Join(", ", onlineUsers)}");
            await base.OnConnectedAsync();
        }

        public override async Task OnDisconnectedAsync(Exception? exception)
        {
            var userIdString = Context.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdString) || !Guid.TryParse(userIdString, out var userId) || userId == Guid.Empty)
            {
                Console.WriteLine("UserId không hợp lệ trong OnDisconnectedAsync");
                await base.OnDisconnectedAsync(exception);
                return;
            }

            Console.WriteLine($"🔌 Client ngắt kết nối: ConnectionId: {Context.ConnectionId}, UserId: {userId}, Lý do: {exception?.Message ?? "Không rõ"}");
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, userId.ToString());
            Console.WriteLine($"👥 Đã xóa ConnectionId {Context.ConnectionId} khỏi group {userId}");

            await _redisService.RemoveItemFromListAsync<string>($"user_connections:{userId}", Context.ConnectionId);
            var connections = await _redisService.GetListAsync<string>($"user_connections:{userId}");

            if (connections == null || !connections.Any())
            {
                Console.WriteLine($"🗑️ Không còn kết nối nào cho user {userId}, đánh dấu offline");
                await _redisService.SaveDataAsync($"user_last_seen:{userId}", DateTime.UtcNow.ToString("o"), TimeSpan.FromHours(24));
                await _redisService.RemoveDataAsync($"user_status:{userId}");
                await _redisService.RemoveDataAsync($"user_connections:{userId}");

                var friends = await _redisService.GetFriendsAsync(userId.ToString());
                Console.WriteLine($"Gửi UserOffline cho bạn bè của {userId}: {string.Join(", ", friends)}");
                foreach (var friendIdStr in friends)
                {
                    if (Guid.TryParse(friendIdStr, out var friendId) && friendId != userId)
                    {
                        await Clients.Group(friendId.ToString()).SendAsync("UserOffline", userId.ToString());
                        Console.WriteLine($"📤 Đã gửi UserOffline đến {friendId}");
                    }
                }
            }
            else
            {
                Console.WriteLine($"⚠️ Vẫn còn {connections.Count} kết nối cho user {userId}");
            }

            await base.OnDisconnectedAsync(exception);
        }

        private async Task<List<string>> GetOnlineUsers()
        {
            var onlineUsers = new List<string>();
            var keys = await _redisService.GetKeysAsync("user_status:*");
            foreach (var key in keys)
            {
                var status = await _redisService.GetDataAsync<string>(key);
                if (status == "online")
                {
                    var userId = key.Replace("user_status:", "");
                    onlineUsers.Add(userId);
                }
            }
            return onlineUsers;
        }
        public async Task DisconnectUser()
        {
            var userIdString = Context.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdString) || !Guid.TryParse(userIdString, out var userId) || userId == Guid.Empty)
            {
                Console.WriteLine("UserId không hợp lệ trong DisconnectUser");
                return;
            }

            Console.WriteLine($"🔌 User {userId} ngắt kết nối chủ động qua DisconnectUser: ConnectionId: {Context.ConnectionId} tại {DateTime.UtcNow}");
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, userId.ToString());
            Console.WriteLine($"👥 Đã xóa ConnectionId {Context.ConnectionId} khỏi group {userId}");

            await _redisService.RemoveItemFromListAsync<string>($"user_connections:{userId}", Context.ConnectionId);
            var connections = await _redisService.GetListAsync<string>($"user_connections:{userId}");

            if (connections == null || !connections.Any())
            {
                Console.WriteLine($"🗑️ Không còn kết nối nào cho user {userId}, đánh dấu offline");
                await _redisService.SaveDataAsync($"user_last_seen:{userId}", DateTime.UtcNow.ToString("o"), TimeSpan.FromHours(24));
                await _redisService.RemoveDataAsync($"user_status:{userId}");
                await _redisService.RemoveDataAsync($"user_connections:{userId}");

                var friends = await _redisService.GetFriendsAsync(userId.ToString());
                Console.WriteLine($"Gửi UserOffline cho bạn bè của {userId}: {string.Join(", ", friends)}");
                foreach (var friendIdStr in friends)
                {
                    if (Guid.TryParse(friendIdStr, out var friendId) && friendId != userId)
                    {
                        await Clients.Group(friendId.ToString()).SendAsync("UserOffline", userId.ToString());
                        Console.WriteLine($"📤 Đã gửi UserOffline đến {friendId} tại {DateTime.UtcNow}");
                    }
                }
            }
            else
            {
                Console.WriteLine($"⚠️ Vẫn còn {connections.Count} kết nối cho user {userId}");
            }
        }

        public async Task KeepAlive()
        {
            var userIdString = Context.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdString) || !Guid.TryParse(userIdString, out var userId))
            {
                Console.WriteLine("KeepAlive: UserId không hợp lệ");
                return;
            }

            var connections = await _redisService.GetListAsync<string>($"user_connections:{userId}");
            if (connections != null && connections.Contains(Context.ConnectionId))
            {
                await _redisService.SaveDataAsync($"user_status:{userId}", "online", TimeSpan.FromSeconds(30));
                Console.WriteLine($"🔄 Làm mới trạng thái online cho user {userId}");
            }
            else
            {
                Console.WriteLine($"⚠️ ConnectionId {Context.ConnectionId} không hợp lệ cho user {userId}, ngắt kết nối");
                Context.Abort();
            }
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
        public async Task SendTyping(string conversationId, string friendId)
        {
            var userIdString = Context.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdString) || !Guid.TryParse(userIdString, out var userId) || userId == Guid.Empty)
            {
                return;
            }

            if (!Guid.TryParse(conversationId, out var convIdGuid) || !Guid.TryParse(friendId, out var friendGuid))
            {
                return;
            }

            // Gửi trực tiếp đến người bạn kia, thay vì dùng OthersInGroup
            await Clients.User(friendGuid.ToString()).SendAsync("UserTyping", userId.ToString());
        }

        public async Task MarkMessagesAsSeen(string messageId,MessageStatus status)
        {
            var userIdString = Context.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdString) || !Guid.TryParse(userIdString, out var userId) || userId == Guid.Empty)
            {
                Console.WriteLine("MarkMessagesAsSeen: UserId không hợp lệ");
                return;
            }

            if (!Guid.TryParse(messageId, out var messIdGuid))
            {
                Console.WriteLine($"MarkMessagesAsSeen: ConversationId không hợp lệ: {messageId}");
                return;
            }

            Console.WriteLine($"User {userId} đánh dấu đã xem conversation {messIdGuid}");

            // --- GỌI SERVICE ĐỂ CẬP NHẬT TRẠNG THÁI SEEN ---
            try
            {
                await _messageStatusService.MarkMessagesAsync(messIdGuid, userId,status);
                Console.WriteLine($"✅ Đã xử lý cập nhật Seen status trong conversation {messIdGuid} theo yêu cầu của user {userId}.");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Lỗi khi xử lý MarkMessagesAsSeenAsync cho conversation {messIdGuid}, reader {userId}: {ex.Message}");
                // Ghi log chi tiết lỗi
            }       
        }
        
    }
}
