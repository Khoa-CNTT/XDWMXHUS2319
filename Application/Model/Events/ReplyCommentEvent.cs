using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Model.Events
{
    public class ReplyCommentEvent : INotification
    {
        public Guid PostId {  get; set; }
        public Guid CommentOwnerId { get; set; }
        public Guid ResponderId { get; set; }
        public string? ResponderName { get; set; }
        public string Message { get; set; }

        public ReplyCommentEvent(Guid postId, Guid commentOwnerId, Guid cesponderId, string message)
        {
            PostId = postId;
            CommentOwnerId = commentOwnerId;
            ResponderId = cesponderId;
            Message = message;
        }
    }
}
