using Pipelines.Sockets.Unofficial.Buffers;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Model.Events
{
    public class LikeCommentEvent : INotification
    {
        public Guid ReceivedId { get; set; }

        public ResponseNotificationModel Data { get; set; }
        public LikeCommentEvent(Guid receivedId, ResponseNotificationModel data)
        {
            ReceivedId = receivedId;
            Data = data;
        }
    }
}
