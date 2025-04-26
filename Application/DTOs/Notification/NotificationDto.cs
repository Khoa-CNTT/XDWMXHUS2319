using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.DTOs.Notification
{
    public class NotificationDto
    {
        public Guid Id { get; set; }
        public string Title { get; set; } = null!;
        public string? Content { get; set; }
        public string? Url { get; set; }
        public string Type { get; set; } = null!;
        public required string CreatedAt { get; set; }
        public bool IsRead { get; set; }
        public Guid ReceiverId { get; set; } // Người nhận thông báo
        public Guid? SenderId { get; set; }
        public string? SenderName { get; set; }
        public string? SenderProfilePicture { get; set; }
    }
}
