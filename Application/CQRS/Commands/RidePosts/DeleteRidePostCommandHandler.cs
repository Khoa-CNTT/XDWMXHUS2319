using Application.CQRS.Commands.Posts;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.CQRS.Commands.RidePosts
{
    public class DeleteRidePostCommandHandler : IRequestHandler<DeleteRidePostCommand, ResponseModel<bool>>
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IUserContextService _userContextService;

        public DeleteRidePostCommandHandler(IUnitOfWork unitOfWork, IUserContextService userContextService)
        {
            _unitOfWork = unitOfWork;
            _userContextService = userContextService;
        }

        public async Task<ResponseModel<bool>> Handle(DeleteRidePostCommand request, CancellationToken cancellationToken)
        {
            // 🔥 Lấy thông tin user hiện tại
            var userId = _userContextService.UserId();
            // 🔥 Lấy thông tin bài viết
            var ridePost = await _unitOfWork.RidePostRepository.GetByIdAsync(request.PostId);
            // 🔥 Kiểm tra xem bài viết có tồn tại không
            if (ridePost == null)
            {
                return ResponseFactory.Fail<bool>("Không tìm thấy bài viết này", 404);
            }
            // 🔥 Kiểm tra xem user hiện tại có quyền xóa bài viết không
            if (ridePost.UserId != userId)
            {
                return ResponseFactory.Fail<bool>("Bạn không có quyền xóa bài viết này", 403);
            }
            // 🔥 Kiểm tra xem bài viết có bị xóa chưa
            if (ridePost.IsDeleted)
            {
                return ResponseFactory.Fail<bool>("Bài viết này đã bị xóa", 404);
            }
            // 🔥 Bắt đầu giao dịch
            await _unitOfWork.BeginTransactionAsync();
            try
            {
                // 🔥 Xóa mềm tất cả bài chia sẻ liên quan (đệ quy)
                ridePost.Delete();
                // 🔥 Lưu thay đổi
                await _unitOfWork.SaveChangesAsync();
                await _unitOfWork.CommitTransactionAsync();
                return ResponseFactory.Success(true, "Xóa bài viết thành công", 200);
            }
            catch (Exception ex)
            {
                await _unitOfWork.RollbackTransactionAsync();
                return ResponseFactory.Error<bool>("Lỗi Error", 500, ex);
            }
        }
    }
}
