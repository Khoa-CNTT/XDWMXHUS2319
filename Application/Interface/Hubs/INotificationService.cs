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
        Task SendNotificationWhenTripEnds(Guid driverId, Guid passengerId, string message);
        //gửi cảnh báo khi gps bị tắt
        Task SendShareNotificationAsync(Guid postId, Guid userId);
        Task SendInAppNotificationAsync(Guid driverId, string message);
        Task SendAlertAsync(Guid driverId, string message);
        Task SendCommentNotificationAsync(Guid postId, Guid commenterId, string commenterName);
        Task SendReplyNotificationAsync(Guid commentId, Guid responderId, string responderName);
    }

}
