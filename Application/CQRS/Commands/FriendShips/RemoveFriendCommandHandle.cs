﻿

namespace Application.CQRS.Commands.Friends
{
    public class RemoveFriendCommandHandle : IRequestHandler<RemoveFriendCommand, ResponseModel<string>>
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IUserContextService _userContextService;
        private readonly IRedisService _redisService;

        public RemoveFriendCommandHandle(
            IUnitOfWork unitOfWork,
            IUserContextService userContextService,
            IRedisService redisService)
        {
            _unitOfWork = unitOfWork;
            _userContextService = userContextService;
            _redisService = redisService;
        }

        public async Task<ResponseModel<string>> Handle(RemoveFriendCommand request, CancellationToken cancellationToken)
        {
            var currentUserId = _userContextService.UserId();

            var friendship = await _unitOfWork.FriendshipRepository
                .GetFriendshipAsync(currentUserId, request.FriendId);

            if (friendship == null || friendship.Status != FriendshipStatusEnum.Accepted)
            {
                return ResponseFactory.Fail<string>("Không tồn tại mối quan hệ bạn bè", 400);
            }

            await _unitOfWork.BeginTransactionAsync();
            try
            {
                // Gọi hàm xóa mềm
                friendship.Remove();

                // Cập nhật lại trạng thái trong repository
                await _unitOfWork.FriendshipRepository.UpdateAsync(friendship);

                // (Tùy chọn) Xóa thông báo "đã trở thành bạn bè" nếu có
                await _unitOfWork.NotificationRepository
                    .DeleteAcceptedFriendRequestNotificationAsync(friendship.UserId, friendship.FriendId);

                await _unitOfWork.SaveChangesAsync();
                await _unitOfWork.CommitTransactionAsync();
                // Xóa khỏi Redis
                await _redisService.RemoveFriendAsync(friendship.UserId.ToString(), friendship.FriendId.ToString());
                return ResponseFactory.Success<string>("Đã hủy kết bạn", 200);
            }
            catch (Exception ex)
            {
                await _unitOfWork.RollbackTransactionAsync();
                return ResponseFactory.Error<string>("Lỗi khi hủy kết bạn", 500, ex);
            }
        }
    }
}