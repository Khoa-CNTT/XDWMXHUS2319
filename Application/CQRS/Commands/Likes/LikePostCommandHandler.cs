using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Application.Interface.Hubs;
using Application.Model.Events;
using Microsoft.AspNetCore.SignalR;
using Microsoft.Extensions.DependencyInjection;

namespace Application.CQRS.Commands.Likes
{
    public class LikePostCommandHandler : IRequestHandler<LikePostCommand,ResponseModel<bool>>
    {
        private readonly ILikeService _likeService;
        private readonly IPublisher _publisher; // MediatR để phát sự kiện
        private readonly INotificationService _notificationService;

        public LikePostCommandHandler(ILikeService likeService, IPublisher publisher, INotificationService notificationService)
        {
            _likeService = likeService;
            _publisher = publisher;
            _notificationService = notificationService;

        }

        public async Task<ResponseModel<bool>> Handle(LikePostCommand request, CancellationToken cancellationToken)
        {
            if (request.UserId == Guid.Empty || request.PostId == Guid.Empty)
            {
                return ResponseFactory.Fail<bool>("Values is requite",400);
            }
            // Lưu Like vào Redis
            if(await _likeService.AddLikeAsync(request.UserId, request.PostId))
            {
                // Phát sự kiện Like
                await _publisher.Publish(new LikeEvent(request.PostId, request.UserId), cancellationToken);
                // Gửi thông báo real-time qua SignalR
                await _notificationService.SendLikeNotificationAsync(request.PostId, request.UserId);
                return ResponseFactory.Success<bool>("Liked", 200);
            }
            return ResponseFactory.Fail<bool>("Liked fail", 500);
        }
    }

}
