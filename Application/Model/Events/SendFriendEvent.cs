using Application.DTOs.FriendShips;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Model.Events
{
    public class SendFriendEvent : INotification
    {
        public Guid FriendId { get; }
        public ResponseNotificationModel Data { get; }

        public SendFriendEvent(Guid friendId, ResponseNotificationModel data)
        {
            FriendId = friendId;
            Data = data;
        }
    }
}
