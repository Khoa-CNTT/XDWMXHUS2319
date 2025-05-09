using Application.Common;
using Application.DTOs.FriendShips;
using Application.DTOs.Post;
using Application.Interface.ContextSerivce;
using Application.Interface.Hubs;
using Domain.Entities;
using Microsoft.Extensions.Hosting;
using Microsoft.ML;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using static Domain.Common.Enums;
using static Domain.Common.Helper;

namespace Application.CQRS.Commands.Friends
{
    public class SendFriendRequestCommandHandle : IRequestHandler<SendFriendRequestCommand, ResponseModel<ResultSendFriendDto>>
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IUserContextService _userContextService;
        private readonly INotificationService _notificationService;
        private readonly IRedisService _redisService;
        public SendFriendRequestCommandHandle(IUnitOfWork unitOfWork, IUserContextService userContextService,
            INotificationService notificationService,
            IRedisService redisService)
        {
            _unitOfWork = unitOfWork;
            _userContextService = userContextService;
            _notificationService = notificationService;
            _redisService = redisService;
        }

        public async Task<ResponseModel<ResultSendFriendDto>> Handle(SendFriendRequestCommand request, CancellationToken cancellationToken)
        {
            var userId = _userContextService.UserId();
            var user = await _unitOfWork.UserRepository.GetByIdAsync(userId);
            if (user == null)
                return ResponseFactory.Fail<ResultSendFriendDto>("Người dùng không tồn tại", 404);
            if (userId == request.FriendId)
                return ResponseFactory.Fail<ResultSendFriendDto>("Không thể gửi lời mời kết bạn với chính mình", 400);

            // Kiểm tra FriendId có tồn tại trong hệ thống không
            var friendExists = await _unitOfWork.UserRepository.ExistUsersAsync(request.FriendId);
            if (!friendExists)
                return ResponseFactory.Fail<ResultSendFriendDto>("Người dùng không tồn tại", 404);

            var existingFriendship = await _unitOfWork.FriendshipRepository
                    .GetFriendshipAsync(userId, request.FriendId);
            if (existingFriendship != null)
            {
                if (existingFriendship.Status == FriendshipStatusEnum.Accepted)
                    return ResponseFactory.Fail<ResultSendFriendDto>("Bạn và người này đã là bạn bè", 400);

                if (existingFriendship.Status == FriendshipStatusEnum.Pending)
                    return ResponseFactory.Fail<ResultSendFriendDto>("Đã gửi lời mời kết bạn trước đó", 400);

                if (existingFriendship.Status == FriendshipStatusEnum.Rejected)
                    return ResponseFactory.Fail<ResultSendFriendDto>("Lời mời kết bạn đã bị từ chối", 400);
                //Nếu như đã xóa kết bạn trước đó thì có thể gửi lại lời mời kết bạn
                if (existingFriendship.Status == FriendshipStatusEnum.Removed)
                {
                    await _unitOfWork.BeginTransactionAsync();
                    try
                    {
                        existingFriendship.Reactivate(); // ✅ theo DDD
                        await _unitOfWork.FriendshipRepository.UpdateAsync(existingFriendship);

                        var notification = new Notification(request.FriendId,
                            userId,
                            $"{user.FullName} đã gửi lời mời kết bạn đến bạn.",
                            NotificationType.SendFriend,
                            null,
                            $"/profile/{userId}"
                        );

                        await _unitOfWork.NotificationRepository.AddAsync(notification);

                        var sendFriendDto = new ResultSendFriendDto
                        {
                            Id = existingFriendship.Id,
                            UserId = userId,
                            FriendId = request.FriendId,
                            CreatedAt = FormatUtcToLocal(existingFriendship.CreatedAt),
                            Status = existingFriendship.Status,
                        };

                        if (existingFriendship.FriendId != userId)
                        {
                            await _notificationService.SendFriendNotificationAsync(request.FriendId, userId,notification.Id);
                        }

                        await _unitOfWork.SaveChangesAsync();
                        await _unitOfWork.CommitTransactionAsync();
                        if (request.redis_key != null)
                        {
                            var key = $"{request.redis_key}";
                            await _redisService.RemoveAsync(key);
                        }
                        return ResponseFactory.Success(sendFriendDto, "Đã gửi lời mời kết bạn", 200);
                    }
                    catch (Exception ex)
                    {
                        await _unitOfWork.RollbackTransactionAsync();
                        return ResponseFactory.Error<ResultSendFriendDto>("Lỗi khi gửi lời mời kết bạn", 400, ex);
                    }
                }

                return ResponseFactory.Fail<ResultSendFriendDto>("Không thể gửi lời mời kết bạn", 400);
            }

            // ❗ Nếu chưa có bất kỳ mối quan hệ nào trước đó (existingFriendship == null)
            await _unitOfWork.BeginTransactionAsync();
            try
            {

                var friendship = new Friendship(userId, request.FriendId);
                await _unitOfWork.FriendshipRepository.AddAsync(friendship);

                var notification = new Notification(request.FriendId,
                    userId,
                    $"{user.FullName} đã gửi lời mời kết bạn đến bạn.",
                    NotificationType.SendFriend,
                    null,
                    $"/profile/{userId}"
                );

                await _unitOfWork.NotificationRepository.AddAsync(notification);

                var sendFriendDto = new ResultSendFriendDto
                {
                    Id = friendship.Id,
                    UserId = userId,
                    FriendId = request.FriendId,
                    CreatedAt = FormatUtcToLocal(friendship.CreatedAt),
                    Status = friendship.Status,
                };

                if (friendship.FriendId != userId)
                {
                    await _notificationService.SendFriendNotificationAsync(request.FriendId, userId,notification.Id);

                }

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
}
