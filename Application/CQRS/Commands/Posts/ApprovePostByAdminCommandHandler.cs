using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.CQRS.Commands.Posts
{
    public class ApprovePostByAdminCommandHandler : IRequestHandler<ApprovePostByAdminCommand, ResponseModel<bool>>
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IUserContextService _userContextService;
        public ApprovePostByAdminCommandHandler(IUnitOfWork unitOfWork, IUserContextService userContextService)
        {
            _unitOfWork = unitOfWork;
            _userContextService = userContextService;
        }
        public async Task<ResponseModel<bool>> Handle(ApprovePostByAdminCommand request, CancellationToken cancellationToken)
        {
            var userId = _userContextService.UserId();
            if (userId == Guid.Empty)
            {
                return ResponseFactory.Fail<bool>("Không thể xác định người dùng", 401);
            }
            var post = await _unitOfWork.PostRepository.GetByIdAsync(request.PostId);
            if (post == null)
            {
                return ResponseFactory.Fail<bool>("Bài viết không tồn tại", 404);
            }
            if (post.ApprovalStatus != ApprovalStatusEnum.Pending)
            {
                return ResponseFactory.Fail<bool>("Bài viết không phải trạng thái pending", 400);
            }

            post.AdminApprove();
            await _unitOfWork.PostRepository.UpdateAsync(post);
            await _unitOfWork.SaveChangesAsync();
            return ResponseFactory.Success(true, "Duyệt bài viết thành công", 200);
        }
    }
}
