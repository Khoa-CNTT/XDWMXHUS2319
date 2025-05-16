using Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Interface.Hubs
{
    public interface INotificationService
    {
        Task SendLikeNotificationAsync(Guid postId, Guid userId);
        Task SendLikeComentNotificationAsync(Guid postId, Guid commentId, Guid userId);
        Task SendNotificationUpdateLocationAsync(Guid driverId, Guid? passengerId, float latitude, float longitude, string location, bool isEnd,string endLocation);                //gửi cảnh báo khi gps bị tắt
        Task SendFriendNotificationAsync(Guid friendId, Guid userId, Guid notificationId);
        Task SendAcceptFriendNotificationAsync(Guid friendId , Guid userId, Guid notificationId);
        Task SendAcceptRideNotificationAsync(Guid passengerId, Guid userId, Guid notificationId);
        Task SendAlertAsync(Guid driverId, string message);
        Task SendInAppNotificationAsync(Guid driverId, string message);

        Task SendShareNotificationAsync(Guid postId, Guid userId, Guid postOwnerId, Guid notificationId);

        Task SendCommentNotificationAsync(Guid postId, Guid commenterId, Guid postOwnerId , Guid notificationId);
        Task SendReplyNotificationAsync(Guid postId, Guid commentId, Guid responderId);

        Task SendNotificationNewMessageAsync(Guid receiverId, string message);
        Task SendNotificationMessageWithIsSeenFalse(Guid conversationId, Guid receiverId);

        Task SendReportNotificationToAdmins(Guid reporterId, Guid postId, string reason, string reporterName);
    }
}
