using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.CQRS.Commands.Notifications
{
    public class MarkNotificationAsReadCommandHandler : IRequestHandler<MarkNotificationAsReadCommand, ResponseModel<bool>>
    {
        private readonly INotificationRepository _notificationRepository;
        private readonly IUserContextService _userContext;
        private readonly IUnitOfWork _unitOfWork;

        public MarkNotificationAsReadCommandHandler(
            INotificationRepository notificationRepository,
            IUserContextService userContext,
            IUnitOfWork unitOfWork)
        {
            _notificationRepository = notificationRepository;
            _userContext = userContext;
            _unitOfWork = unitOfWork;
        }

        public async Task<ResponseModel<bool>> Handle(MarkNotificationAsReadCommand request, CancellationToken cancellationToken)
        {
            var userId = _userContext.UserId();

            var notification = await _notificationRepository.GetByIdAsync(request.NotificationId, userId, cancellationToken);
            if (notification == null)
                return ResponseFactory.Fail<bool>("Không tìm thấy thông báo", 404);

            if (notification.IsRead)
                return ResponseFactory.Fail<bool>("Thông báo đã được đọc", 400);

            notification.MarkAsRead(); // Gọi logic từ entity
            await _unitOfWork.NotificationRepository.UpdateAsync(notification);
            await _unitOfWork.SaveChangesAsync();
            return ResponseFactory.Success(true, "Đã đánh dấu thông báo là đã đọc", 200);
        }
    }
}
