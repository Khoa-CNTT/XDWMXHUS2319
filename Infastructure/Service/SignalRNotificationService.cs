using Application.DTOs.FriendShips;
using Application.Model;

using Application.Model.Events;

using Microsoft.AspNetCore.SignalR;
using MimeKit;

namespace Infrastructure.Service
{
    public class SignalRNotificationService : ISignalRNotificationService
    {
        private readonly IHubContext<NotificationHub> _hubContext;


        public SignalRNotificationService(IHubContext<NotificationHub> hubContext)
        {
            _hubContext = hubContext;


        }

         public async Task SendCommentNotificationSignalR(Guid postOwnerId, ResponseNotificationModel data)
              {
                 await _hubContext.Clients.User(postOwnerId.ToString()).SendAsync("ReceiveCommentNotification", data);
          }

        /// <summary>
        /// Gửi cảnh báo khẩn cấp đến tài xế qua thông báo ứng dụng và email (nếu cần)
        /// </summary>
        public async Task SendAlertSignalR(Guid driverId, string message)
        {
            // Gọi Hub để gửi SignalR
            await _hubContext.Clients.Group(driverId.ToString()).SendAsync("ReceiveAlert", message);
        }
        public async Task SendLikeNotificationSiganlR(Guid ownerId, ResponseNotificationModel data)
        {
            await _hubContext.Clients.User(ownerId.ToString())
                .SendAsync("ReceiveLikeNotification", data);
        }

        public async Task SendNotificationUpdateLocationSignalR(Guid driverId, Guid passengerId, string message)
        {
            await _hubContext.Clients.User(driverId.ToString())
                .SendAsync("ReceiveNotificationUpdateLocation", message);
            await _hubContext.Clients.User(passengerId.ToString())
                .SendAsync("ReceiveNotificationUpdateLocation", message);
        }


        public async Task SendReplyNotificationSignalR(Guid receiverId, ResponseNotificationModel data)
        {
            await _hubContext.Clients.User(receiverId.ToString())
                    .SendAsync("ReceiveReplyCommentNotification", data);
        }

        public async Task SendShareNotificationAsync(Guid userId, ResponseNotificationModel data)
        {
            await _hubContext.Clients.User(userId.ToString()).SendAsync("ReceiveSharePostNotification", data);
        }

        public async Task SendFriendNotificationSignalR(Guid friendId, ResponseNotificationModel data)
        {
            await _hubContext.Clients.User(friendId.ToString()).SendAsync("ReceiveFriendNotification", data);
        }

        public async Task SendAnswerFriendNotificationSignalR(Guid friendId, ResponseNotificationModel data)
        {
            await _hubContext.Clients.User(friendId.ToString()).SendAsync("ReceiveFriendAnswerNotification", data);
        }


        public async Task SendNewMessageSignalRAsync(SendMessageNotificationEvent sendMessageNotificationEvent)
        {
            await _hubContext.Clients.User(sendMessageNotificationEvent.ReceiverId.ToString())
                .SendAsync("ReceiveMessageNotification", sendMessageNotificationEvent.Message);
        }
    }
}
