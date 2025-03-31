using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Model.Events
{
    public class LikeEvent : INotification
    {
        public Guid OwnerId { get; set; }
        public Guid PostId { get; set; }
        public string Message { get; set; }
        public LikeEvent(Guid postId, Guid ownerId, string message)
        {
            PostId = postId;
            OwnerId = ownerId;
            Message = message;
        }
    }

}
