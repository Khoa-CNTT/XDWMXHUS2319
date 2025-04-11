using Application.Interface.ContextSerivce;
using Application.Interface.Hubs;
using Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using static Domain.Common.Enums;

namespace Application.CQRS.Commands.Friends
{
    public class AcceptFriendRequestCommandHandle : IRequestHandler<AcceptFriendRequestCommand, ResponseModel<bool>>
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IUserContextService _userContext;
        private readonly INotificationService _notificationService;
        public AcceptFriendRequestCommandHandle(IUnitOfWork unitOfWork, IUserContextService userContext, INotificationService notificationService)
        {
            _unitOfWork = unitOfWork;
            _userContext = userContext;
            _notificationService = notificationService;
        }

        public async Task<ResponseModel<bool>> Handle(AcceptFriendRequestCommand request, CancellationToken cancellationToken)
        {
            var userId = _userContext.UserId();
            var friendship = await _unitOfWork.FriendshipRepository
                .GetPendingRequestAsync(request.FriendshipId, userId); // Đúng sender và receiver
            if (friendship == null)
                return ResponseFactory.Fail<bool>("Lời mời kết bạn không tồn tại", 404);

            if (friendship.FriendId != userId)
                return ResponseFactory.Fail<bool>("Bạn không có quyền chấp nhận lời mời này", 403);

            if (friendship.Status == FriendshipStatusEnum.Accepted)
                return ResponseFactory.Fail<bool>("Lời mời đã được chấp nhận trước đó", 400);
            var user = await _unitOfWork.UserRepository.GetByIdAsync(userId);
            if (user == null)
                return ResponseFactory.Fail<bool>("Người dùng không tồn tại", 404);
            await _unitOfWork.BeginTransactionAsync();
            try
            {

                friendship.Accept();
                await _unitOfWork.FriendshipRepository.UpdateAsync(friendship);
                // Luu vao Notification
                var notification = new Notification(friendship.UserId,
                        userId,
                        $"{user.FullName} đã chấp nhận lời mời kết bạn",
                        NotificationType.AcceptFriend,
                        null,
                         $"/profile/{userId}"
                    );
                await _unitOfWork.NotificationRepository.AddAsync(notification);
                if (friendship.UserId != userId)
                {
                    await _notificationService.SendAcceptFriendNotificationAsync(request.FriendshipId, userId);
                }
                //Xóa thông báo gửi lời mời
                await _unitOfWork.NotificationRepository
                           .DeletePendingFriendRequestNotificationAsync(friendship.UserId, friendship.FriendId);
                await _unitOfWork.SaveChangesAsync();
                await _unitOfWork.CommitTransactionAsync();
                return ResponseFactory.Success(true, "Đã chấp nhận lời mời kết bạn", 200);
            }
            catch(Exception ex)
            {
                await _unitOfWork.RollbackTransactionAsync();
                return ResponseFactory.Error<bool>("Lỗi: ", 500, ex);
            }
           
        }
    }
}
