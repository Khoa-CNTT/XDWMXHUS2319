using static Domain.Common.Enums;

namespace Domain.Interface
{
    public interface INotificationRepository : IBaseRepository<Notification>
    {
        Task DeletePendingFriendRequestNotificationAsync(Guid senderId, Guid receiverId);
        Task DeleteAcceptedFriendRequestNotificationAsync(Guid userId, Guid friendId);
    }

}
