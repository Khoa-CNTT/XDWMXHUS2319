using Application.DTOs.Notification;
using Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.CQRS.Queries.Notifications
{
    public class GetReadNotificationsQueryHandler : IRequestHandler<GetReadNotificationsQuery, ResponseModel<GetNotificationResponse>>
    {
        private readonly INotificationRepository _notificationRepository;
        private readonly IUserContextService _userContext;

        public GetReadNotificationsQueryHandler(INotificationRepository notificationRepository, IUserContextService userContext)
        {
            _notificationRepository = notificationRepository;
            _userContext = userContext;
        }

        public async Task<ResponseModel<GetNotificationResponse>> Handle(GetReadNotificationsQuery request, CancellationToken cancellationToken)
        {
            var userId = _userContext.UserId();
            var notifications = await _notificationRepository.GetByReadStatusAsync(userId, true, request.Cursor, request.PageSize, cancellationToken);
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
            DateTime localTime = DateTime.Parse("2025-04-23 17:54:13");

            // Chuyển đổi sang UTC (trừ 7 giờ)
            DateTime utcTime = localTime.ToUniversalTime();

            // Định dạng lại theo yêu cầu
            string utcTimeFormatted = utcTime.ToString("yyyy-MM-ddTHH:mm:ss");
            Console.WriteLine(utcTimeFormatted);  // Output: 2025-04-23T10:54:13
            return ResponseFactory.Success(result, "Lấy thông báo đã đọc thành công", 200);
        }
    }
}