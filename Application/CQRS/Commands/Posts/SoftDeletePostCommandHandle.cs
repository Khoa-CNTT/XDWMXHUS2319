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

        public SoftDeletePostCommandHandle(IUnitOfWork unitOfWork, IUserContextService userContextService)
        {
            _unitOfWork = unitOfWork;
            _userContextService = userContextService;
        }

        public async Task<ResponseModel<bool>> Handle(SoftDeletePostCommand request, CancellationToken cancellationToken)
        {
            await _unitOfWork.BeginTransactionAsync();
            try
            {
                var userId = _userContextService.UserId();
                var post = await _unitOfWork.PostRepository.GetByIdAsync(request.PostId);

                if (post == null)
                {
                    return ResponseFactory.Fail<bool>("Không tìm thấy bài viết này", 404);
                }

                if (post.UserId != userId)
                {
                    await _unitOfWork.RollbackTransactionAsync();
                    return ResponseFactory.Fail<bool>("Bạn không có quyền xóa bài viết này", 403);
                }
                if (post.IsDeleted)
                {
                    await _unitOfWork.RollbackTransactionAsync();
                    return ResponseFactory.Fail<bool>("Bình luận này đã bị xóa", 404);
                }
                // Xóa mềm comment gốc
                post.Delete();

                // 🔥 Tìm và xóa mềm tất cả các replies
                var sharedPosts = await _unitOfWork.PostRepository.GetSharedPostAllAsync(request.PostId);
                foreach (var sharedPost in sharedPosts)
                {
                    sharedPost.Delete();
                }

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
