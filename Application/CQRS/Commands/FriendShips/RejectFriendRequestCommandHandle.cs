using Application.Interface.ContextSerivce;
using Application.Interface.Hubs;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using static Domain.Common.Enums;

namespace Application.CQRS.Commands.Friends
{
    public class DeclineFriendRequestCommandHandle : IRequestHandler<RejectFriendRequestCommand, ResponseModel<bool>>
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IUserContextService _userContextService;
        private readonly INotificationService _notificationService;
        public DeclineFriendRequestCommandHandle(IUnitOfWork unitOfWork, IUserContextService userContextService, INotificationService notificationService)
        {
            _unitOfWork = unitOfWork;
            _userContextService = userContextService;
            _notificationService = notificationService;
        }

        public async Task<ResponseModel<bool>> Handle(RejectFriendRequestCommand request, CancellationToken cancellationToken)
        {
            var userId = _userContextService.UserId();

            var friendship = await _unitOfWork.FriendshipRepository
                .GetPendingRequestAsync(request.FriendId, userId); // Lấy đúng request

            if (friendship == null)
                return ResponseFactory.Fail<bool>("Lời mời kết bạn không tồn tại", 404);

            if (friendship.FriendId != userId)
                return ResponseFactory.Fail<bool>("Bạn không có quyền từ chối lời mời này", 403);

            if (friendship.Status == FriendshipStatusEnum.Rejected)
                return ResponseFactory.Fail<bool>("Lời mời đã bị từ chối trước đó", 400);

            var user = await _unitOfWork.UserRepository.GetByIdAsync(userId);
            if (user == null)
                return ResponseFactory.Fail<bool>("Người dùng không tồn tại", 404);

            await _unitOfWork.BeginTransactionAsync();
            try
            {
                friendship.Reject();
                await _unitOfWork.FriendshipRepository.UpdateAsync(friendship);

                // Lưu thông báo vào Notification nếu muốn
                var notification = new Notification(
                    friendship.UserId,
                    userId,
                    $"{user.FullName} đã từ chối lời mời kết bạn",
                    NotificationType.RejectFriend,
                    null,
                    $"/profile/{userId}"
                );
                await _unitOfWork.NotificationRepository.AddAsync(notification);
                if (friendship.UserId != userId)
                {
                    await _notificationService.SendRejectFriendNotificationAsync(request.FriendId, userId);
                }
                // Xóa thông báo lời mời kết bạn
                await _unitOfWork.NotificationRepository
                            .DeletePendingFriendRequestNotificationAsync(friendship.UserId, friendship.FriendId);
                await _unitOfWork.SaveChangesAsync();
                await _unitOfWork.CommitTransactionAsync();

                return ResponseFactory.Success(true, "Đã từ chối lời mời kết bạn", 200);
            }
            catch (Exception ex)
            {
                await _unitOfWork.RollbackTransactionAsync();
                return ResponseFactory.Error<bool>("Lỗi từ hệ thống", 500, ex);
            }
        }
    }
}
