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
        Task SendNotificationUpdateLocationAsync(Guid driverId, Guid passengerId, float latitude, float longitude, string location, bool isEnd);                //gửi cảnh báo khi gps bị tắt
        Task SendFriendNotificationAsync(Guid friendId, Guid userId);
        Task SendAcceptFriendNotificationAsync(Guid friendId , Guid userId);
        Task SendRejectFriendNotificationAsync(Guid friendId, Guid userId);
        Task SendAlertAsync(Guid driverId, string message);
        Task SendInAppNotificationAsync(Guid driverId, string message);

        Task SendShareNotificationAsync(Guid postId, Guid userId);

        Task SendCommentNotificationAsync(Guid postId, Guid commenterId);
        Task SendReplyNotificationAsync(Guid postId, Guid commentId, Guid responderId);

        Task SendNotificationNewMessageAsync(Guid conversationId, Guid receiverId, string content, Guid messageId);    
    }
}
