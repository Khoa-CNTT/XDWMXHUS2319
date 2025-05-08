using Application.Interface.ContextSerivce;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.CQRS.Commands.Posts
{
    public class DeletePostCommandHandler : IRequestHandler<DeletePostCommand, ResponseModel<bool>>
    {
        private readonly IPostRepository _postRepository;
        private readonly IUnitOfWork _unitOfWork;
        private readonly IUserContextService _userContextService;
        private readonly IRedisService _redisService;

        public DeletePostCommandHandler(IPostRepository postRepository, IUnitOfWork unitOfWork, IUserContextService userContextService, IRedisService redisService)
        {
            _postRepository = postRepository;
            _unitOfWork = unitOfWork;
            _userContextService = userContextService;
            _redisService = redisService;
        }

        public async Task<ResponseModel<bool>> Handle(DeletePostCommand request, CancellationToken cancellationToken)
        {
            var userId = _userContextService.UserId();

            var post = await _postRepository.GetByIdAsync(request.PostId);
            // Kiểm tra post có tồn tại không
            if (post == null || post.IsDeleted)
            {
                return ResponseFactory.Fail<bool>("Post not found", 404);
            }

            // Kiểm tra quyền sở hữu
            if (post.UserId != userId)
            {
                return ResponseFactory.Fail<bool>("You are not the owner of this post", 403);
            }
            await _unitOfWork.BeginTransactionAsync();
            try
            {
                // Xóa mềm bài viết
                post.SoftDelete();

                // Xóa mềm các bình luận, lượt thích, bài chia sẻ
                await _postRepository.SoftDeletePostAsync(post.Id);
                // Cập nhật bài viết
                await _postRepository.UpdateAsync(post);
                await _unitOfWork.CommitTransactionAsync();
                if (request.redis_key != null)
                {
                    var key = $"{request.redis_key}";
                    await _redisService.RemoveAsync(key);
                }
                return ResponseFactory.Success(true, "Xóa bài viết thành công", 200);
            }
            catch (Exception)
            {
                await _unitOfWork.RollbackTransactionAsync();
                return ResponseFactory.Fail<bool>("Xóa không thành công", 500);
            }
        }
    }

}
