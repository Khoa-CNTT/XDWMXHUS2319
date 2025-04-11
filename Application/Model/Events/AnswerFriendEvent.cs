using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Model.Events
{
    public class AnswerFriendEvent : INotification
    {
        public Guid FriendId { get; }
        public ResponseNotificationModel Data { get; }

        public AnswerFriendEvent(Guid friendId, ResponseNotificationModel data)
        {
            FriendId = friendId;
            Data = data;
        }
    }
}
