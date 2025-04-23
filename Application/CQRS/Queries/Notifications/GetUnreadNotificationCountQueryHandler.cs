using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.CQRS.Queries.Notifications
{
    public class GetUnreadNotificationCountQueryHandler : IRequestHandler<GetUnreadNotificationCountQuery, ResponseModel<int>>
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IUserContextService _userContext;

        public GetUnreadNotificationCountQueryHandler(IUnitOfWork unitOfWork, IUserContextService userContext)
        {
            _unitOfWork = unitOfWork;
            _userContext = userContext;
        }

        public async Task<ResponseModel<int>> Handle(GetUnreadNotificationCountQuery request, CancellationToken cancellationToken)
        {
            var userId = _userContext.UserId();

            var count = await _unitOfWork.NotificationRepository.CountUnreadNotificationsAsync(userId, cancellationToken);

            return ResponseFactory.Success(count, "Lấy số thông báo chưa đọc thành công", 200);
        }
    }
}