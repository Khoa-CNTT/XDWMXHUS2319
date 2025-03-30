using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Model.Events
{
    public class ShareEvent : INotification
    {
        public Guid UserId { get; set; }
        public Guid PostId { get; set; }
        
        public ShareEvent(Guid postId, Guid userId)
        {
            PostId = postId;
            UserId = userId;
            
        }  
    }
}
