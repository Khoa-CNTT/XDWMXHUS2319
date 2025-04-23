using Application.DTOs.Notification;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.CQRS.Queries.Notifications
{
    public class GetNotificationsByTypeQueryHandler : IRequestHandler<GetNotificationsByTypeQuery, ResponseModel<GetNotificationResponse>>
    {
        private readonly INotificationRepository _notificationRepository;
        private readonly IUserContextService _userContext;

        public GetNotificationsByTypeQueryHandler(INotificationRepository notificationRepository, IUserContextService userContext)
        {
            _notificationRepository = notificationRepository;
            _userContext = userContext;
        }

        public async Task<ResponseModel<GetNotificationResponse>> Handle(GetNotificationsByTypeQuery request, CancellationToken cancellationToken)
        {
            // Chuyển số Type sang Enum NotificationType
            if (!Enum.IsDefined(typeof(NotificationType), request.Type))
            {
                return ResponseFactory.Fail<GetNotificationResponse>("Loại thông báo không hợp lệ", 400);
            }

            var notificationType = (NotificationType)request.Type;
            var userId = _userContext.UserId();
            var notifications = await _notificationRepository.GetByTypeAsync(userId, notificationType, request.Cursor, request.PageSize, cancellationToken);
            // ✅ Trường hợp không có thông báo nào
            if (notifications == null || !notifications.Any())
            {
                return ResponseFactory.Success<GetNotificationResponse>("Không có thông báo nào", 200);
            }
            // Kiểm tra còn dữ liệu không
            bool hasMore = notifications.Count > request.PageSize;
            if (hasMore)
            {
                notifications.RemoveAt(notifications.Count - 1); // Bỏ cái dư
            }

            DateTime? nextCursor = hasMore
                ? notifications.Last().CreatedAt
                : null;

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
                    SenderProfilePicture = n.Sender?.ProfilePicture != null ? $"{Constaint.baseUrl}{n.Sender?.ProfilePicture}" : null
                }).ToList(),
                NextCursor = nextCursor
            };

            return ResponseFactory.Success(result, "Lấy thông báo theo loại thành công",200);
        }
    }
}