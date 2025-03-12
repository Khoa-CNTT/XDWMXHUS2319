using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Model.Events
{
    public class LikeEvent : INotification
    {
        public Guid UserId { get; set; }
        public Guid PostId { get; set; }
        public LikeEvent(Guid postId, Guid userId)
        {
            PostId = postId;
            UserId = userId;
        }
    }

}
