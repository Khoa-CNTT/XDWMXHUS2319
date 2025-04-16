using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Interface
{
    public interface IMessageStatusService
    {
        /// <summary>
        /// Cập nhật các tin nhắn 'Sent' thành 'Delivered' cho người nhận khi họ online.
        /// Đồng thời thông báo trạng thái 'Delivered' về cho người gửi.
        /// </summary>
        /// <param name="recipientId">ID của người dùng vừa online.</param>
        Task MarkMessagesAsDeliveredAsync(Guid recipientId);

        /// <summary>
        /// Cập nhật các tin nhắn 'Sent' hoặc 'Delivered' thành 'Seen' trong một cuộc hội thoại khi người nhận đọc.
        /// Đồng thời thông báo trạng thái 'Seen' về cho người gửi.
        /// </summary>
        /// <param name="conversationId">ID của cuộc hội thoại.</param>
        /// <param name="readerId">ID của người dùng đã đọc (người nhận).</param>
        Task MarkMessagesAsSeenAsync(Guid messageId, Guid readerId);
    }
}
