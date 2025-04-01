using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Interface.Hubs
{
    public interface ISignalRNotificationService
    {
        Task SendAlertSignalR(Guid driverId, string message);
        Task SendLikeNotificationSiganlR(Guid postId, Guid ownerId, string message);
        Task SendNotificationUpdateLocationSignalR(Guid driverId, Guid passengerId,string message);
        Task SendReplyNotificationSignalR(Guid postId, Guid commentOwnerId, Guid responderId, string message);
        Task SendCommentNotificationSignalR(Guid postId, Guid postOwnerId, Guid commenterId, string message);
    }
}
