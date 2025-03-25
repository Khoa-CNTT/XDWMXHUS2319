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
        public string CommenterName { get; }

        public CommentEvent(Guid postId, Guid commenterId, string commenterName)
        {
            PostId = postId;
            CommenterId = commenterId;
            CommenterName = commenterName;
        }
    }
}
