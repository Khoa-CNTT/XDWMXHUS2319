using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Domain.Entities
{
    public class Like
    {
        public Guid Id { get; private set; }
        public Guid UserId { get; private set; }
        public Guid PostId { get; private set; }
        public DateTime CreatedAt { get; private set; }
        public bool IsLike { get; private set; } = true;
        //CHUPS
        public virtual User? User { get; private set; }

        public virtual Post? Post { get; private set; }
        //dang
        public bool IsDeleted { get; private set; }//xóa mềm
        public void SoftDelete()
        {
            IsDeleted = true;
        }
        public Like(Guid userId, Guid postId)
        {
            if (userId == Guid.Empty) throw new ArgumentException("UserId cannot be empty.");
            if (postId == Guid.Empty) throw new ArgumentException("PostId cannot be empty.");

            Id = Guid.NewGuid();
            UserId = userId;
            PostId = postId;
            CreatedAt = DateTime.UtcNow;
        }

        /// <summary>
        /// Hủy lượt thích
        /// </summary>
        public void Unlike()
        {
            IsLike = false;
        }

        public void ToggleLike()
        {
            IsLike = !IsLike;
        }

        /// <summary>
        /// Thích lại bài viết nếu đã hủy trước đó
        /// </summary>
        public void Relike()
        {
            IsLike = true;
        }
        public void Delete()
        {
            IsDeleted = true;
        }
    }
}

