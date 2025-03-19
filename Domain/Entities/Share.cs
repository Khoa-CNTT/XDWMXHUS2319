using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Domain.Entities
{
    public class Share
    {
        public Guid Id { get; private set; }
        public Guid UserId { get; private set; }  // Không nên nullable (một lượt chia sẻ cần có người chia sẻ)
        public Guid PostId { get; private set; }  // Không nên nullable (một lượt chia sẻ cần gắn với bài viết)
        public DateTime CreatedAt { get; private set; } = DateTime.UtcNow;
        public string? Content { get; private set; } // Tin nhắn hoặc ghi chú khi chia sẻ
        public bool IsDeleted { get; private set; } // Hỗ trợ xóa mềm
        public void SoftDelete()
        {
            IsDeleted = true;
        }

        //CHUPS
        public virtual User User { get; private set; } = null!;
        public virtual Post Post { get; private set; } = null!;

        // Constructor không tham số cho EF Core
        private Share() { }
        public Share(Guid userId, Guid postId, string? message = null)
        {
            if (userId == Guid.Empty) throw new ArgumentException("UserId cannot be empty.");
            if (postId == Guid.Empty) throw new ArgumentException("PostId cannot be empty.");

            Id = Guid.NewGuid();
            UserId = userId;
            PostId = postId;
            Content = message;
            CreatedAt = DateTime.UtcNow;
            IsDeleted = false;
        }

        /// <summary>
        /// Cập nhật tin nhắn hoặc ghi chú khi chia sẻ
        /// </summary>
        public void UpdateMessage(string? newMessage)
        {
            Content = newMessage;
        }

        /// <summary>
        /// Xóa mềm lượt chia sẻ
        /// </summary>
        public void Delete()
        {
            IsDeleted = true;
        }

        /// <summary>
        /// Khôi phục lượt chia sẻ đã xóa
        /// </summary>
        public void Restore()
        {
            IsDeleted = false;
        }
    }
}

