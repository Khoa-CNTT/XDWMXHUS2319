using Application.DTOs.Notification;
using Domain.Entities;
using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.CQRS.Queries.Notifications
{
    public class GetAllNotificationsQueryHandler : IRequestHandler<GetAllNotificationsQuery, ResponseModel<GetNotificationResponse>>
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IUserContextService _userContext;

        public GetAllNotificationsQueryHandler(IUnitOfWork unitOfWork, IUserContextService userContext)
        {
            _unitOfWork = unitOfWork;
            _userContext = userContext;
        }

        public async Task<ResponseModel<GetNotificationResponse>> Handle(GetAllNotificationsQuery request, CancellationToken cancellationToken)
        {
            var userId = _userContext.UserId();
            var fetchCount = request.PageSize + 1;
            var notifications = await _unitOfWork.NotificationRepository.GetAllNotificationsAsync(userId, request.Cursor, request.PageSize, cancellationToken);

            if (request.Cursor.HasValue)
            {
                notifications = notifications
                    .Where(f => f.CreatedAt < request.Cursor.Value)
                    .OrderByDescending(f => f.CreatedAt)
                    .ToList();
            }

            // Kiểm tra còn dữ liệu không
            bool hasMore = notifications.Count == fetchCount;
            if (hasMore)
            {
                notifications = notifications.Take(request.PageSize).ToList();
            }

            if (notifications == null || !notifications.Any())
            {
                return ResponseFactory.Success<GetNotificationResponse>("Không có thông báo nào", 200);
            }

            DateTime? nextCursor = hasMore
                ? notifications.Last().CreatedAt
                : null;

            // ✅ Trường hợp không có thông báo nào


            var result = new GetNotificationResponse
            {
                Notifications = notifications.Select(n => new NotificationDto
                {
                    Id = n.Id,
                    Title = n.Title,
                    Content = n.Content,
                    Url = n.Url,
                    Type = n.Type.ToString(),
                    CreatedAt = FormatUtcToLocal(n.CreatedAt),
                    IsRead = n.IsRead,
                    ReceiverId = n.ReceiverId,
                    SenderId = n.SenderId,
                    SenderName = n.Sender?.FullName,
                    SenderProfilePicture = n.Sender?.ProfilePicture != null
                    ? $"{Constaint.baseUrl}{n.Sender.ProfilePicture}"
                    : null
                }).ToList(),
                NextCursor = hasMore ? notifications.Last().CreatedAt : null
            };

            return ResponseFactory.Success(result, "Lấy tất cả thông báo thành công", 200);
        }
    }
}