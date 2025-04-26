using Application.Interface.ContextSerivce;
using Domain.Interface;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.CQRS.Commands.Posts
{
    public class SoftDeletePostCommandHandle : IRequestHandler<SoftDeletePostCommand, ResponseModel<bool>>
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IUserContextService _userContextService;
        private readonly IPostService _postService;

        public SoftDeletePostCommandHandle(IUnitOfWork unitOfWork, IUserContextService userContextService, IPostService postService)
        {
            _unitOfWork = unitOfWork;
            _userContextService = userContextService;
            _postService = postService;
        }

        public async Task<ResponseModel<bool>> Handle(SoftDeletePostCommand request, CancellationToken cancellationToken)
        {
            // 🔥 Lấy thông tin user hiện tại
            var userId = _userContextService.UserId();
            // 🔥 Lấy thông tin bài viết
            var post = await _unitOfWork.PostRepository.GetByIdAsync(request.PostId);
            // 🔥 Kiểm tra xem bài viết có tồn tại không
            if (post == null)
                {
                    return ResponseFactory.Fail<bool>("Không tìm thấy bài viết này", 404);
                }
            // 🔥 Kiểm tra xem user hiện tại có quyền xóa bài viết không
            if (post.UserId != userId)
                {
                    return ResponseFactory.Fail<bool>("Bạn không có quyền xóa bài viết này", 403);
                }
            // 🔥 Kiểm tra xem bài viết có bị xóa chưa
            if (post.IsDeleted)
                {
                    return ResponseFactory.Fail<bool>("Bài viết này đã bị xóa", 404);
                }
            // 🔥 Bắt đầu giao dịch
            await _unitOfWork.BeginTransactionAsync();
            try
            {
                // 🔥 Xóa mềm tất cả bài chia sẻ liên quan (đệ quy)
                await _postService.SoftDeletePostAndRelatedDataAsync(post.Id);
                // 🔥 Lưu thay đổi
                await _unitOfWork.SaveChangesAsync();
                await _unitOfWork.CommitTransactionAsync();
                return ResponseFactory.Success(true, "Xóa bài viết và các bài chia sẻ thành công", 200);
            }
            catch (Exception ex)
            {
                await _unitOfWork.RollbackTransactionAsync();
                return ResponseFactory.Error<bool>("Lỗi Error", 500, ex);
            }
        }
    }
}
