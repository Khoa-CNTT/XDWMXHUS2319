using Application.DTOs.Comments;
using Application.DTOs.Shares;
using Application.DTOs.User;
using Application.Interface.ContextSerivce;
using Domain.Interface;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.CQRS.Queries.Shares
{
    public class GetSharesByPostIdQueryHandle : IRequestHandler<GetSharesByPostIdQuery, ResponseModel<GetSharedUsersResponse>>
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IShareService _shareService;
        private readonly IUserContextService _userContextService;

        public GetSharesByPostIdQueryHandle(IUnitOfWork unitOfWork, IShareService shareService, IUserContextService userContextService)
        {
            _unitOfWork = unitOfWork;
            _shareService = shareService;
            _userContextService = userContextService;
        }

        public async Task<ResponseModel<GetSharedUsersResponse>> Handle(GetSharesByPostIdQuery request, CancellationToken cancellationToken)
        {
            var userId = _userContextService.UserId();
            if (userId == Guid.Empty)
            {
                return ResponseFactory.Fail<GetSharedUsersResponse>("Người dùng chưa đăng nhập không thể xem người chia sẻ", 401);
            }

            var response = await _shareService.GetSharedUsersByPostIdAsync(request.PostId, request.LastUserId, cancellationToken);

            // ❌ Không có bất kỳ lượt chia sẻ nào từ đầu
            if (response == null || response.Users == null || !response.Users.Any())
            {
                return ResponseFactory.Success(new GetSharedUsersResponse(), "Không có lượt chia sẻ nào", 200);
            }

            // ❌ Người dùng cố lấy tiếp nhưng không còn ai
            if (request.LastUserId.HasValue && response.NextCursor == null)
            {
                return ResponseFactory.Success(new GetSharedUsersResponse(), "Không còn người dùng để lấy", 200);
            }

            // ✅ Còn dữ liệu, trả về danh sách bình thường
            return ResponseFactory.Success(response, "Lấy danh sách chia sẻ thành công", 200);
        }
    }
}
