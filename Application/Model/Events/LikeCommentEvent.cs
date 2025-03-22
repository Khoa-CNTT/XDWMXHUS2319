using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Model.Events
{
    public class LikeCommentEvent
    {
        public Guid UserId { get; set; }
        public Guid CommentId { get; set; }
        public LikeCommentEvent(Guid userId, Guid commentId)
        {
            UserId = userId;
            CommentId = commentId;
        }
    }
}
