namespace Application.Model.Events
{
    public class AdminNotificationEvent : INotification
    {
        public Guid AdminId { get; set; } // Admin nhận thông báo
        public ResponseNotificationModel NotificationData { get; set; } // Dữ liệu thông báo gửi đi

        public AdminNotificationEvent(Guid adminId, ResponseNotificationModel notificationData)
        {
            AdminId = adminId;
            NotificationData = notificationData;
        }
    }
}
