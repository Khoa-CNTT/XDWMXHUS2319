using Application.Interface.Hubs;
using DuyTanSharingSystem.Hubs;
using Microsoft.AspNetCore.SignalR;

namespace DuyTanSharingSystem.Service
{
    public class NotificationService : INotificationService
    {
        private readonly IHubContext<NotificationHub> _hubContext;
        public NotificationService(IHubContext<NotificationHub> hubContext)
        {
            _hubContext = hubContext;
        }
        public async Task SendLikeNotificationAsync(Guid postId, Guid userId)
        {
            await _hubContext.Clients.All.SendAsync("ReceiveNotification", $"User {userId} liked post {postId}");
        }
    }
}
