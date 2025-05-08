using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Domain.Entities
{
    public class CommentLike
    {
        public Guid Id { get;private set; } = Guid.NewGuid();

        public Guid UserId { get; private set; }
        public virtual User? User { get; private set; }
        public Guid CommentId { get; private set; }
        public bool IsLike { get; private set; } = true;
        public virtual Comment Comment { get;private set; } = null!;

        public DateTime CreatedAt { get;private set; } = DateTime.UtcNow;
        public CommentLike(Guid userId, Guid commentId)
        {
            Id = Guid.NewGuid();
            UserId = userId;
            CommentId = commentId;
            CreatedAt = DateTime.UtcNow;
            IsLike = true;
        }
        public void SetLikeStatus(bool isLike)
        {
            IsLike = isLike;
        }
        public void UnLike()
        {
            IsLike = false;
        }
    }
}
