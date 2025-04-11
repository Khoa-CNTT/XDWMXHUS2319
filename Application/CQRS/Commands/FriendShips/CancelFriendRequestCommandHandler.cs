using Application.Interface.ContextSerivce;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using static Domain.Common.Enums;

namespace Application.CQRS.Commands.Friends
{
    public class CancelFriendRequestCommandHandler : IRequestHandler<CancelFriendRequestCommand, ResponseModel<string>>
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IUserContextService _userContextService;

        public CancelFriendRequestCommandHandler(
            IUnitOfWork unitOfWork,
            IUserContextService userContextService,
            ILogger<CancelFriendRequestCommandHandler> logger)
        {
            _unitOfWork = unitOfWork;
            _userContextService = userContextService;
        }

        public async Task<ResponseModel<string>> Handle(CancelFriendRequestCommand request, CancellationToken cancellationToken)
        {
            var currentUserId = _userContextService.UserId();

            // Kiểm tra tồn tại mối quan hệ bạn bè
            var friendship = await _unitOfWork.FriendshipRepository
                .GetFriendshipAsync(currentUserId, request.FriendId);

            if (friendship == null || friendship.Status != FriendshipStatusEnum.Pending || friendship.UserId != currentUserId)
            {
                return ResponseFactory.Fail<string>("Không thể hủy lời mời kết bạn", 400);
            }
            await _unitOfWork.BeginTransactionAsync();
            try
            {
               
                //Xóa lời mời kết bạn
                await _unitOfWork.FriendshipRepository.DeleteAsync(friendship.Id);
                //Xóa thông báo gửi kết bạn trước đó
                await _unitOfWork.NotificationRepository
                         .DeletePendingFriendRequestNotificationAsync(friendship.UserId, friendship.FriendId);
                // Lưu database
                await _unitOfWork.SaveChangesAsync();
                await _unitOfWork.CommitTransactionAsync();
                return ResponseFactory.Success<string>("Đã hủy lời mời kết bạn", 200);
            }
            catch (Exception ex)
            {
                await _unitOfWork.RollbackTransactionAsync();
                return ResponseFactory.Error<string>("Lỗi khi hủy lời mời kết bạn", 500, ex);
            }
        }
    }
}