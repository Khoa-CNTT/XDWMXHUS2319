using Application.Interface.ChatAI;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;

namespace Infrastructure.Service
{
    public class ChatStreamService : IChatStreamService
    {
        private readonly IHubContext<ChatHub> _hubContext;
        private readonly IServiceProvider _serviceProvider;

        public ChatStreamService(IHubContext<ChatHub> hubContext, IServiceProvider serviceProvider)
        {
            _hubContext = hubContext;
            _serviceProvider = serviceProvider;
        }

        public async Task ProcessStreamMessageAsync(Guid conversationId, Guid userId, string data, bool isFinal, string query, string answer, int tokenCount)
        {
            // Gửi câu trả lời qua SignalR
            if (!string.IsNullOrEmpty(data))
            {
                await _hubContext.Clients.Group(conversationId.ToString())
                    .SendAsync("ReceiveAnswer", data, isFinal);
            }

            // Xử lý CRUD nếu là JSON
            if (!string.IsNullOrEmpty(data) && data.StartsWith("{"))
            {
                try
                {
                    var actionData = JsonSerializer.Deserialize<CrudAction>(data);
                    if (actionData != null)
                    {
                        await HandleCrudAction(actionData, userId, conversationId);
                    }
                }
                catch (JsonException) { /* Không phải JSON CRUD, bỏ qua */ }
            }

            // Lưu lịch sử chat khi hoàn tất
            if (isFinal && !string.IsNullOrEmpty(query) && !string.IsNullOrEmpty(answer))
            {
                using var scope = _serviceProvider.CreateScope();
                var unitOfWork = scope.ServiceProvider.GetRequiredService<IUnitOfWork>();
                await StoreChatHistory(unitOfWork, conversationId, userId, query, answer, tokenCount);
            }
        }

        private async Task HandleCrudAction(CrudAction action, Guid userId, Guid conversationId)
        {
            using var scope = _serviceProvider.CreateScope();
            var httpClient = scope.ServiceProvider.GetRequiredService<IHttpClientFactory>().CreateClient();
            string message;

            switch (action.action)
            {
                case "delete_post":
                    var deleteResponse = await httpClient.DeleteAsync($"http://localhost:5000/api/posts/{action.post_id}", new CancellationToken());
                    message = deleteResponse.IsSuccessStatusCode ? "Đã xóa bài post." : "Không có quyền hoặc bài post không tồn tại.";
                    break;

                case "update_email":
                    var updateResponse = await httpClient.PutAsync(
                        $"http://localhost:5000/api/users/{userId}/email",
                        new StringContent(JsonSerializer.Serialize(new { email = action.email }), Encoding.UTF8, "application/json"),
                        new CancellationToken()
                    );
                    message = updateResponse.IsSuccessStatusCode ? $"Đã cập nhật email thành {action.email}." : "Không có quyền hoặc email không hợp lệ.";
                    break;

                case "create_post":
                    var createResponse = await httpClient.PostAsync(
                        "http://localhost:5000/api/posts",
                        new StringContent(JsonSerializer.Serialize(new { content = action.content }), Encoding.UTF8, "application/json"),
                        new CancellationToken()
                    );
                    message = createResponse.IsSuccessStatusCode ? "Đã tạo bài post." : "Không có quyền hoặc nội dung không hợp lệ.";
                    break;

                default:
                    message = "Hành động không được hỗ trợ.";
                    break;
            }

            await _hubContext.Clients.Group(conversationId.ToString())
                .SendAsync("ReceiveAnswer", message, true);
        }

        private async Task StoreChatHistory(IUnitOfWork unitOfWork, Guid conversationId, Guid userId, string query, string answer, int tokenCount)
        {
            var conversation = await unitOfWork.AIConversationRepository.GetByIdAsync(conversationId);
            if (conversation == null)
                return;

            conversation.UpdateTimestamp();
            var chatHistory = new AIChatHistory(conversationId, query, answer, tokenCount);
            await unitOfWork.AIChatHistoryRepository.AddAsync(chatHistory);

            // Giới hạn lịch sử chat
            var histories = await unitOfWork.AIChatHistoryRepository.GetHistoriesByConversationId(conversationId);
            int cumulativeTokens = 0;
            for (int i = 0; i < histories.Count; i++)
            {
                cumulativeTokens += histories[i].TokenCount;
                if (i >= 10 || cumulativeTokens > 1000)
                {
                    var idsToDelete = histories.Skip(i).Select(h => h.Id);
                    await unitOfWork.AIChatHistoryRepository.DeleteRangeAsync(idsToDelete);
                    break;
                }
            }

            await unitOfWork.SaveChangesAsync();
        }

        private class CrudAction
        {
            public string action { get; set; } = string.Empty;
            public string post_id { get; set; } = string.Empty;
            public string email { get; set; } = string.Empty;
            public string content { get; set; } = string.Empty;
        }
    }
}
