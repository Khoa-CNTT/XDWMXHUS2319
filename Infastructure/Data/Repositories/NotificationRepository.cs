
using Domain.Entities;
using System;

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

        public async Task<List<Notification>> GetAllNotificationsAsync(Guid receiverId, DateTime? cursor, int pageSize, CancellationToken cancellationToken)
        {
            var query = _context.Notifications
                .Include(n => n.Sender)
             .Where(n => n.ReceiverId == receiverId);

            if (cursor.HasValue)
            {
                query = query.Where(n => n.CreatedAt < cursor.Value);
            }

            return await query
                .OrderByDescending(n => n.CreatedAt)
                .Take(pageSize + 1)
                .ToListAsync(cancellationToken);
        }

        public async Task<List<Notification>> GetByTypeAsync(Guid receiverId, NotificationType type, DateTime? cursor, int pageSize, CancellationToken cancellationToken)
        {
            var query = _context.Notifications
          .Include(n => n.Sender)
          .Where(n => n.ReceiverId == receiverId && n.Type == type);

            if (cursor.HasValue)
            {
                query = query.Where(n => n.CreatedAt < cursor.Value);
            }

            return await query
                .OrderByDescending(n => n.CreatedAt)
                .Take(pageSize + 1)
                .ToListAsync(cancellationToken);
        }

        public async Task<List<Notification>> GetByReadStatusAsync(Guid receiverId, bool isRead, DateTime? cursor, int pageSize, CancellationToken cancellationToken)
        {
            var query = _context.Notifications
             .Include(n => n.Sender)
            .Where(n => n.ReceiverId == receiverId && n.IsRead == isRead);

            if (cursor.HasValue)
            {
                query = query.Where(n => n.CreatedAt < cursor.Value);
            }

            return await query
                .OrderByDescending(n => n.CreatedAt)
                .Take(pageSize + 1)
                .ToListAsync(cancellationToken);
        }

        public async Task<Notification?> GetByIdAsync(Guid notificationId, Guid userId, CancellationToken cancellationToken)
        {
            return await _context.Notifications
                .FirstOrDefaultAsync(n => n.Id == notificationId && n.ReceiverId == userId, cancellationToken);
        }

        public async Task<int> CountUnreadNotificationsAsync(Guid receiverId, CancellationToken cancellationToken = default)
        {
            return await _context.Notifications
                .Where(n => n.ReceiverId == receiverId && !n.IsRead)
                .CountAsync(cancellationToken);
        }
    }
}
