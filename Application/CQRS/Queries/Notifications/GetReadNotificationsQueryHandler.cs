

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

            if (!notifications.Any())
            {
                if (!request.Cursor.HasValue)
                {
                    // Trường hợp không có dữ liệu ngay từ đầu (lần đầu gọi API mà không có cursor)
                    return ResponseFactory.Success<GetNotificationResponse>("Không có thông báo nào", 200);
                }
                else
                {
                    // Trường hợp gọi với cursor nhưng không còn dữ liệu
                    return ResponseFactory.Success(new GetNotificationResponse
                    {
                        Notifications = new List<NotificationDto>(),
                        NextCursor = null
                    }, "Lấy thông báo đã đọc thành công", 200);
                }
            }
            var filteredNotifications = notifications
            .Where(n => n.Type != NotificationType.RideInvite && n.Type != NotificationType.NewMessage)
            .ToList();

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

            return ResponseFactory.Success(result, "Lấy thông báo đã đọc thành công", 200);
        }
    }
}