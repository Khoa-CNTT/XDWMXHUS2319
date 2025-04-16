using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Infrastructure.Service
{
    public class MessageStatusService : IMessageStatusService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IConversationRepository _conversationRepository;
        private readonly IMessageRepository _messageRepository;
        private readonly IHubContext<ChatHub> _chatHubContext;

        public MessageStatusService(
            IUnitOfWork unitOfWork,
            IConversationRepository conversationRepository,
            IMessageRepository messageRepository,
            IHubContext<ChatHub> chatHubContext)
        {
            _unitOfWork = unitOfWork;
            _conversationRepository = conversationRepository;
            _messageRepository = messageRepository;
            _chatHubContext = chatHubContext;
        }

        public async Task MarkMessagesAsDeliveredAsync(Guid recipientId)
        {
            // Lấy danh sách conversation của recipient
            var conversations = await _conversationRepository.GetAllConversationsAsync(recipientId);
            if (!conversations.Any()) return;

            var conversationIds = conversations.Select(c => c.Id).ToList();

            // Lấy các tin nhắn cần cập nhật status
            var messagesToUpdate = await _messageRepository.GetMessagesForDeliveryAsync(conversationIds, recipientId);
            if (!messagesToUpdate.Any()) return;

            Console.WriteLine($"Updating {messagesToUpdate.Count} messages to Delivered for recipient {recipientId}");

            var deliveredMessageIdsBySender = new Dictionary<Guid, List<Guid>>();

            foreach (var message in messagesToUpdate)
            {
                if (message.Status == MessageStatus.Sent)
                {
                    message.UpdateStatus(MessageStatus.Delivered);

                    if (!deliveredMessageIdsBySender.ContainsKey(message.SenderId))
                    {
                        deliveredMessageIdsBySender[message.SenderId] = new List<Guid>();
                    }
                    deliveredMessageIdsBySender[message.SenderId].Add(message.Id);
                }
            }

            // Lưu thay đổi
            await _unitOfWork.SaveChangesAsync();

            // Thông báo cho người gửi
            foreach (var kvp in deliveredMessageIdsBySender)
            {
                var senderId = kvp.Key;
                var messageIds = kvp.Value;
                Console.WriteLine($"Notifying sender {senderId} about {messageIds.Count} delivered messages.");
                await _chatHubContext.Clients.Group(senderId.ToString())
                    .SendAsync("MessagesDelivered", messageIds);
            }
        }

        public async Task MarkMessagesAsSeenAsync(Guid messageId, Guid readerId)
        {
            var messagesToUpdate = await _messageRepository.GetListMessagesForSeenAsync(messageId, readerId);

            if (messagesToUpdate == null || messagesToUpdate.Count == 0)
                return;

            var seenAt = DateTime.UtcNow;

            // Cập nhật status và thời gian seen
            foreach (var msg in messagesToUpdate)
            {
                msg.UpdateStatus(MessageStatus.Seen);
                msg.UpdateSeenAt(seenAt);
                await _messageRepository.UpdateAsync(msg);
            }

            // Sử dụng BulkUpdate để tối ưu hiệu năng


            // Lấy tin nhắn cuối cùng để gửi về client
            var lastSeenMessage = messagesToUpdate.OrderByDescending(m => m.SentAt).FirstOrDefault();
            if (lastSeenMessage != null)
            {
                await _chatHubContext.Clients.Group(lastSeenMessage.SenderId.ToString())
                    .SendAsync("LastMessageSeen", new
                    {
                        lastSeenMessageId = lastSeenMessage.Id,
                        seenAt = seenAt
                    });
            }

            Console.WriteLine($"✅ Đã cập nhật Seen {messagesToUpdate.Count} tin nhắn. Cuối cùng: {lastSeenMessage?.Id}");
        }

    }
}
