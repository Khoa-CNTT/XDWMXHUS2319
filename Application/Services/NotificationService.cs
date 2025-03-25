using Application.Interface.Hubs;
using Application.Model.Events;
using Domain.Interface;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Services
{
    public class NotificationService : INotificationService
    {
        private readonly IRidePostService _rideService;
        private readonly IPublisher _publisher;  // 🔥 Dùng Event Bus để publish event
        private readonly IUnitOfWork _unitOfWork;

        public NotificationService( IRidePostService rideService, IPublisher publisher, IUnitOfWork unitOfWork)
        {
            _rideService = rideService;
            _publisher = publisher;
            _unitOfWork = unitOfWork;
        }

        public async Task SendAlertAsync(Guid driverId, string message)
        {
            await _publisher.Publish(new SendInAppNotificationEvent(driverId, message));
        }

        public async Task SendCommentNotificationAsync(Guid postId, Guid commenterId, string commenterName)
        {

            await _publisher.Publish(new CommentEvent(postId, commenterId, commenterName));
        }

        public async Task SendInAppNotificationAsync(Guid driverId, string message)
        {
            await _publisher.Publish(new SendInAppNotificationEvent(driverId,message));
        }

        public async Task SendLikeNotificationAsync(Guid postId, Guid userId)
        {

            // 🔥 Đẩy event sang IPublisher  để Infrastructure xử lý (SignalR hoặc Email)
            await _publisher.Publish(new LikeEvent(postId, userId));
        }

        public async Task SendNotificationWhenTripEnds(Guid driverId, Guid passengerId,string message)
        {
            // 🔥 Đẩy event sang IPublisher
            await _publisher.Publish(new UpdateLocationEvent(driverId, passengerId, message));
        }
    }
}
