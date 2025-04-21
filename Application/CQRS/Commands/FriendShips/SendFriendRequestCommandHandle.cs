using Application.CQRS.Commands.Friends;
using Application.DTOs.FriendShips;

public class SendFriendRequestCommandHandle : IRequestHandler<SendFriendRequestCommand, ResponseModel<ResultSendFriendDto>>
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IUserContextService _userContextService;
    private readonly INotificationService _notificationService;

    public SendFriendRequestCommandHandle(IUnitOfWork unitOfWork, IUserContextService userContextService, INotificationService notificationService)
    {
        _unitOfWork = unitOfWork;
        _userContextService = userContextService;
        _notificationService = notificationService;
    }

    public async Task<ResponseModel<ResultSendFriendDto>> Handle(SendFriendRequestCommand request, CancellationToken cancellationToken)
    {
        var userId = _userContextService.UserId();
        var user = await _unitOfWork.UserRepository.GetByIdAsync(userId);
        if (user == null)
            return ResponseFactory.Fail<ResultSendFriendDto>("Người dùng không tồn tại", 404);

        if (userId == request.FriendId)
            return ResponseFactory.Fail<ResultSendFriendDto>("Không thể gửi lời mời kết bạn với chính mình", 400);

        var friendExists = await _unitOfWork.UserRepository.ExistUsersAsync(request.FriendId);
        if (!friendExists)
            return ResponseFactory.Fail<ResultSendFriendDto>("Người dùng không tồn tại", 404);

        var existingFriendship = await _unitOfWork.FriendshipRepository.GetFriendshipAsync(userId, request.FriendId);
        if (existingFriendship != null)
        {
            switch (existingFriendship.Status)
            {
                case FriendshipStatusEnum.Accepted:
                    return ResponseFactory.Fail<ResultSendFriendDto>("Bạn và người này đã là bạn bè", 400);

                case FriendshipStatusEnum.Pending:
                    return ResponseFactory.Fail<ResultSendFriendDto>("Đã gửi lời mời kết bạn trước đó", 400);

                case FriendshipStatusEnum.Rejected:
                    // Trường hợp đặc biệt:
                    // - Người gửi trước bị từ chối => không thể gửi lại
                    // - Người từ chối trước đó → được phép gửi lại

                    if (existingFriendship.UserId == userId)
                    {
                        // Người dùng hiện tại là người gửi trước => bị từ chối → không được gửi lại
                        return ResponseFactory.Fail<ResultSendFriendDto>("Lời mời kết bạn của bạn đã bị từ chối. Bạn không thể gửi lại.", 400);
                    }
                    // Nếu người dùng hiện tại là người đã từ chối trước → được gửi lại
                    if (existingFriendship.FriendId == userId)
                    {
                        await _unitOfWork.FriendshipRepository.DeleteAsync(existingFriendship.Id);
                        return await CreateNewFriendRequestAsync(user, userId, request.FriendId);
                    }
                    else
                    {
                        // Người dùng hiện tại là người từ chối trước đó → được phép gửi lại (tạo mới quan hệ)
                        return await CreateNewFriendRequestAsync(user, userId, request.FriendId);
                    }

                case FriendshipStatusEnum.Removed:
                    // Xóa mối quan hệ cũ và tạo mới
                    await _unitOfWork.FriendshipRepository.DeleteAsync(existingFriendship.Id);
                    return await CreateNewFriendRequestAsync(user, userId, request.FriendId);

                default:
                    return ResponseFactory.Fail<ResultSendFriendDto>("Không thể gửi lời mời kết bạn", 400);
            }
        }

        // Chưa có quan hệ nào
        return await CreateNewFriendRequestAsync(user, userId, request.FriendId);
    }

    private async Task<ResponseModel<ResultSendFriendDto>> CreateNewFriendRequestAsync(User user, Guid userId, Guid friendId)
    {
        await _unitOfWork.BeginTransactionAsync();
        try
        {
            var friendship = new Friendship(userId, friendId);
            await _unitOfWork.FriendshipRepository.AddAsync(friendship);

            var notification = new Notification(friendId, userId, $"{user.FullName} đã gửi lời mời kết bạn đến bạn.", NotificationType.SendFriend, null, $"/profile/{userId}");
            await _unitOfWork.NotificationRepository.AddAsync(notification);

            var sendFriendDto = new ResultSendFriendDto
            {
                Id = friendship.Id,
                UserId = userId,
                FriendId = friendId,
                CreatedAt = FormatUtcToLocal(friendship.CreatedAt),
                Status = friendship.Status,
            };

            await _notificationService.SendFriendNotificationAsync(friendId, userId, notification.Id);

            await _unitOfWork.SaveChangesAsync();
            await _unitOfWork.CommitTransactionAsync();

            return ResponseFactory.Success(sendFriendDto, "Đã gửi lời mời kết bạn", 200);
        }
        catch (Exception ex)
        {
            await _unitOfWork.RollbackTransactionAsync();
            return ResponseFactory.Error<ResultSendFriendDto>("Lỗi khi gửi lời mời kết bạn", 400, ex);
        }
    }
}
