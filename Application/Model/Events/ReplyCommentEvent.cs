using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Model.Events
{
    public class ReplyCommentEvent : INotification
    {
        public Guid CommentId { get; set; }
        public Guid ResponderId { get; set; }
        public string ResponderName { get; set; }

        public ReplyCommentEvent(Guid commentId, Guid cesponderId, string responderName)
        {
            CommentId = commentId;
            ResponderId = cesponderId;
            ResponderName = responderName;
        }
    }
}
