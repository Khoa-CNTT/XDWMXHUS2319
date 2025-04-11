
﻿using System;

using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using static Domain.Common.Enums;


namespace Infrastructure.Data.Repositories
{
    public class NotificationRepository : BaseRepository<Notification>, INotificationRepository
    {
        public NotificationRepository(AppDbContext context) : base(context)
        {
        }

        public override Task<bool> DeleteAsync(Guid id)
        {
            throw new NotImplementedException();
        }

        public async Task DeletePendingFriendRequestNotificationAsync(Guid senderId, Guid receiverId)
        {
            var notification = await _context.Notifications
                .Where(n =>
                    n.SenderId == senderId &&
                    n.ReceiverId == receiverId &&
                    n.Type == NotificationType.SendFriend)
                .FirstOrDefaultAsync();

            if (notification != null)
            {
                _context.Notifications.Remove(notification);
            }
        }
        public async Task DeleteAcceptedFriendRequestNotificationAsync(Guid userId, Guid friendId)
        {
            var notification = await _context.Notifications
                .Where(n =>
                    ((n.SenderId == userId && n.ReceiverId == friendId) ||
                     (n.SenderId == friendId && n.ReceiverId == userId)) &&
                    n.Type == NotificationType.AcceptFriend)
                .FirstOrDefaultAsync();

            if (notification != null)
            {
                _context.Notifications.Remove(notification);
            }
        }
    }
}
