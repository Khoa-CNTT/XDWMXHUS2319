using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using static Domain.Common.Enums;

namespace Domain.Entities
{
    public class Notification
    {
        public Guid Id { get; set; }

        public Guid ReceiverId { get; set; }         // Người nhận thông báo
        public Guid? SenderId { get; set; }          // Người tạo ra hành động (nếu có)

        public string Title { get; set; } = null!;   // Tiêu đề (VD: "Nguyễn Văn A đã bình luận...")
        public string? Content { get; set; }         // Nội dung chi tiết (nếu có)
        public string? Url { get; set; }             // Link điều hướng tới (bài viết, tin nhắn,...)

        public NotificationType Type { get; set; }   // Kiểu thông báo (Enum)
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public bool IsRead { get; set; } = false;

        public User Receiver { get; set; } = null!;
        public User? Sender { get; set; }

        public Notification(Guid receiverId, string title, NotificationType type, string? content = null, string? url = null)
        {
            ReceiverId = receiverId;
            Title = title;
            Type = type;
            Content = content;
            Url = url;
        }
    }
}
