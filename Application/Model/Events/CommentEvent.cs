using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Model.Events
{
    public class CommentEvent : INotification
    {
        public Guid PostId { get; }
        public Guid CommenterId { get; }
        public Guid PostOwnerId { get; }
        public string? CommenterName { get; }
        public string Message { get; }

        public CommentEvent(Guid postId, Guid postOwnerId, Guid commenterId, string message)
        {
            PostId = postId;
            PostOwnerId = postOwnerId;
            CommenterId = commenterId;
            Message = message;
        }
    }
}
