using static Domain.Common.Enums;

namespace Domain.Interface
{
    public interface INotificationRepository : IBaseRepository<Notification>
    {
        Task DeletePendingFriendRequestNotificationAsync(Guid senderId, Guid receiverId);
        Task DeleteAcceptedFriendRequestNotificationAsync(Guid userId, Guid friendId);

        Task<List<Notification>> GetAllNotificationsAsync(Guid receiverId, DateTime? cursor, int pageSize, CancellationToken cancellationToken);
        Task<List<Notification>> GetByTypeAsync(Guid receiverId ,NotificationType type, DateTime? cursor, int pageSize, CancellationToken cancellationToken);
        Task<List<Notification>> GetByReadStatusAsync(Guid receiverId, bool isRead, DateTime? cursor, int pageSize, CancellationToken cancellationToken);
        Task<Notification?> GetByIdAsync(Guid notificationId, Guid userId, CancellationToken cancellationToken);
        Task<int> CountUnreadNotificationsAsync(Guid receiverId, CancellationToken cancellationToken = default);
    }

}
