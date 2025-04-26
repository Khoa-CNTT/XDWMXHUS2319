
using static Domain.Common.Enums;

namespace Domain.Entities
{
    public class Notification
    {
        public Guid Id { get;private set; }

        public Guid ReceiverId { get; private set; }         // Người nhận thông báo
        public Guid? SenderId { get; private set; }          // Người tạo ra hành động (nếu có)

        public string Title { get; private set; } = null!;   // Tiêu đề (VD: "Nguyễn Văn A đã bình luận...")
        public string? Content { get; private set; }         // Nội dung chi tiết (nếu có)
        public string? Url { get; private set; }             // Link điều hướng tới (bài viết, tin nhắn,...)

        public NotificationType Type { get; private set; }   // Kiểu thông báo (Enum)
        public DateTime CreatedAt { get; private set; } = DateTime.UtcNow;
        public bool IsRead { get; private set; } = false;

        public User Receiver { get; private set; } = null!;
        public User? Sender { get; private set; }
        protected Notification() { }
        public Notification(Guid receiverId, Guid? senderId, string title, NotificationType type, string? content = null, string? url = null)
        {
            Id = Guid.NewGuid();
            ReceiverId = receiverId;
            SenderId = senderId;
            Title = title;
            Type = type;
            Content = content;
            Url = url;
        }
        //Đánh dấu thông báo là đã đọc
        public void MarkAsRead()
        {
            IsRead = true;
        }
    }
}
