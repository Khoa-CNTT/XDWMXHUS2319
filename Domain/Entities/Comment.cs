using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Domain.Entities
{
    public class Comment
    {
        public Guid Id { get; private set; }
        public Guid UserId { get; private set; }  // Không nên nullable (bình luận cần có người dùng)
        public Guid PostId { get; private set; }  // Không nên nullable (cần gắn với bài viết)
        public string Content { get; private set; }
        public DateTime CreatedAt { get; private set; }
        public DateTime? UpdatedAt { get; private set; }
        
        //CHUPS
        public virtual User? User { get; private set; }
        public virtual Post? Post { get; private set; }
        public bool IsDeleted { get; private set; } // Hỗ trợ xóa mềm
        public void SoftDelete()
        {
            IsDeleted = true;
        }
        public Comment(Guid userId, Guid postId, string content)
        {
            if (userId == Guid.Empty) throw new ArgumentException("UserId cannot be empty.");
            if (postId == Guid.Empty) throw new ArgumentException("PostId cannot be empty.");
            if (string.IsNullOrWhiteSpace(content)) throw new ArgumentException("Content cannot be empty.");

            Id = Guid.NewGuid();
            UserId = userId;
            PostId = postId;
            Content = content;
            CreatedAt = DateTime.UtcNow;
            UpdatedAt = null;
            IsDeleted = false;
        }

        /// <summary>
        /// Chỉnh sửa nội dung bình luận
        /// </summary>
        public void Edit(string newContent)
        {
            if (string.IsNullOrWhiteSpace(newContent)) throw new ArgumentException("Content cannot be empty.");
            Content = newContent;
            UpdatedAt = DateTime.UtcNow;
        }

        /// <summary>
        /// Xóa mềm bình luận
        /// </summary>
        public void Delete()
        {
            IsDeleted = true;
        }

        /// <summary>
        /// Khôi phục bình luận đã xóa
        /// </summary>
        public void Restore()
        {
            IsDeleted = false;
        }
    }
}

