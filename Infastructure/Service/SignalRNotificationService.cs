using Application.Interface;
using Application.Interface.Hubs;
using Application.Services;
using Infrastructure.Email;
using Infrastructure.Hubs;
using Microsoft.AspNetCore.SignalR;

namespace Infrastructure.Service
{
    public class SignalRNotificationService : ISignalRNotificationService
    {
        private readonly IHubContext<NotificationHub> _hubContext;


        public SignalRNotificationService(IHubContext<NotificationHub> hubContext)
        {
            _hubContext = hubContext;


        }

         public async Task SendCommentNotificationSignalR(Guid postId, Guid postOwnerId, Guid commenterId, string message)
              {
                 await _hubContext.Clients.User(postOwnerId.ToString()).SendAsync("ReceiveNotification", message);
          }

        /// <summary>
        /// Gửi cảnh báo khẩn cấp đến tài xế qua thông báo ứng dụng và email (nếu cần)
        /// </summary>
        public async Task SendAlertSignalR(Guid driverId, string message)
        {
            // Gọi Hub để gửi SignalR
            await _hubContext.Clients.Group(driverId.ToString()).SendAsync("ReceiveAlert", message);
        }
        public async Task SendLikeNotificationSiganlR(Guid postId, Guid ownerId, string message)
        {
            await _hubContext.Clients.Group(ownerId.ToString())
                .SendAsync("ReceiveLikeNotification", message);
        }

        public async Task SendNotificationUpdateLocationSignalR(Guid driverId, Guid passengerId, string message)
        {
            await _hubContext.Clients.User(driverId.ToString())
                .SendAsync("ReceiveNotificationUpdateLocation", message);
            await _hubContext.Clients.User(passengerId.ToString())
                .SendAsync("ReceiveNotificationUpdateLocation", message);
        }


        public async Task SendReplyNotificationSignalR(Guid postId, Guid commentOwnerId, Guid responderId, string message)
        {
             await _hubContext.Clients.User(commentOwnerId.ToString()).SendAsync("ReceiveNotification", message);
        }
//         public async Task SendShareNotificationAsync(Guid postId, Guid userId)
 //        {
//             var ownerId = await _postService.GetPostOwnerId(postId);
//             var user = await _userService.GetByIdAsync(userId);

//             if (user == null || ownerId == Guid.Empty) return;

//             string message = $"{user.FullName} đã chia sẻ bài viết của bạn.";

//             await _hubContext.Clients.User(ownerId.ToString())
//                 .SendAsync("ReceiveNotification", message);
//         }

    }
}
