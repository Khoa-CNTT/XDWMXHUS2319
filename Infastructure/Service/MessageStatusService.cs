using Domain.Entities;
using MimeKit;
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

        public async Task MarkMessagesAsync(Guid messageId, Guid readerId, MessageStatus targetStatus)
        {
            var messagesToUpdate = await _messageRepository.GetListMessagesAsync(messageId, readerId, targetStatus);
            if (messagesToUpdate == null || !messagesToUpdate.Any())
                return;
                var seenAt = DateTime.UtcNow;
            // Cập nhật status và thời gian seen (nếu cần)
            foreach (var msg in messagesToUpdate)
            {
                msg.UpdateStatus(targetStatus);
                if (targetStatus == MessageStatus.Seen)
                {
                    msg.UpdateSeenAt(seenAt);
                    msg.UpdateStatus(MessageStatus.Seen);
                }
                else if (targetStatus == MessageStatus.Delivered)
                {
                    msg.UpdateStatus(MessageStatus.Delivered);
                }
            }
                // Cập nhật hàng loạt
            await _messageRepository.BulkUpdateAsync(messagesToUpdate);
            await _unitOfWork.SaveChangesAsync();
            // Lấy tin nhắn cuối cùng để gửi về client
            var lastSeenMessage = messagesToUpdate.OrderByDescending(m => m.SentAt).FirstOrDefault();
            if (lastSeenMessage != null)
            {
                var methodName = targetStatus == MessageStatus.Seen ? "MarkMessagesAsSeen" : "MarkMessagesAsDelivered";
                await _chatHubContext.Clients.Group(lastSeenMessage.SenderId.ToString())
                    .SendAsync(methodName, new
                    {
                        lastSeenMessageId = lastSeenMessage.Id,
                        seenAt,
                        status = targetStatus.ToString()
                    });
            }

            Console.WriteLine($"✅ Đã cập nhật {targetStatus} {messagesToUpdate.Count} tin nhắn. Cuối cùng: {lastSeenMessage?.Id}");
        }

    }
}
