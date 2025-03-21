using Application.DTOs.Post;
using Application.Interface.Api;
using Application.Interface.ContextSerivce;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.CQRS.Commands.Posts
{
    public class UpdatePostCommandHandle : IRequestHandler<UpdatePostCommand, ResponseModel<bool>>
    {
        private readonly IUserContextService _userContextService;
        private readonly IUnitOfWork _unitOfWork;
        private readonly IGeminiService _geminiService;

        public UpdatePostCommandHandle(IUserContextService userContextService, IUnitOfWork unitOfWork, IGeminiService geminiService)
        {
            _userContextService = userContextService;
            _unitOfWork = unitOfWork;
            _geminiService = geminiService;
        }
        public async Task<ResponseModel<bool>> Handle(UpdatePostCommand request, CancellationToken cancellationToken)
        {
            //tìm user id
            var userId = _userContextService.UserId();
            var post = await _unitOfWork.PostRepository.GetByIdAsync(request.PostId);
            if (post == null)
            {
                return ResponseFactory.NotFound<bool>("Post not found", 404);
            }
            if (post.UserId != userId)
            {
                return ResponseFactory.Fail<bool>("Bạn không có quyền chỉnh sửa bài viết này", 403);
            }
            await _unitOfWork.BeginTransactionAsync();
            try
            {
                post.UpdatePost(request.Content, request.ImageUrl, request.VideoUrl, request.Scope);
                //kiểm tra xem bài đăng có hợp lệ không bằng Genimi
                if (!await _geminiService.ValidatePostContentAsync(post.Content))
                {
                    post.RejectAI();
                    await _unitOfWork.RollbackTransactionAsync();
                    return ResponseFactory.Fail<bool>("Warning! Content is not accepted! If you violate it again, your reputation will be deducted!!", 400);
                }
                await _unitOfWork.SaveChangesAsync();
                await _unitOfWork.CommitTransactionAsync();
                return ResponseFactory.Success(true,"Chỉnh sửa bài viết thành công", 200);
            }
            catch (Exception ex)
            {
                await _unitOfWork.RollbackTransactionAsync();
                return ResponseFactory.Error<bool>("Error: ", 500, ex);
            }
        }
    }
}
