﻿using Application.DTOs.FriendShips;
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

        Task SendReplyNotificationSignalR(Guid receiverId, ResponseNotificationModel data);
        Task SendCommentNotificationSignalR(Guid postOwnerId, ResponseNotificationModel data);
        Task SendFriendNotificationSignalR(Guid friendId, ResponseNotificationModel data);
        Task SendAnswerFriendNotificationSignalR(Guid friendId, ResponseNotificationModel data);

        Task SendNewMessageSignalRAsync(SendMessageNotificationEvent sendMessageNotificationEvent);

    }
}
