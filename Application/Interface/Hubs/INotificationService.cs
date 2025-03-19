using Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Interface.Hubs
{
    public interface INotificationService
    {
        Task SendLikeNotificationAsync(Guid postId, Guid userId);
        Task SendNotificationWhenTripEnds(Guid driverId, Guid passengerId);
        //gửi cảnh báo khi gps bị tắt
        Task SendInAppNotificationAsync(Guid driverId, string message);
        Task SendAlertAsync(Guid driverId, string message);
    }

}
