using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using static Domain.Common.Enums;

namespace Domain.Interface
{
    public interface INotificationRepository : IBaseRepository<Notification>
    {
        Task DeletePendingFriendRequestNotificationAsync(Guid senderId, Guid receiverId);
        Task DeleteAcceptedFriendRequestNotificationAsync(Guid userId, Guid friendId);
    }
}
