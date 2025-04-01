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
        Task SendNotificationUpdateLocationAsync(Guid driverId, Guid passengerId, double lat, double lng, bool isEnd);
        //gửi cảnh báo khi gps bị tắt

        Task SendAlertAsync(Guid driverId, string message);
        Task SendInAppNotificationAsync(Guid driverId, string message);

        Task SendShareNotificationAsync(Guid postId, Guid userId);

        Task SendCommentNotificationAsync(Guid postId, Guid commenterId, string commenterName);
        Task SendReplyNotificationAsync(Guid postId, Guid commentId, Guid responderId, string responderName);

    }

}
