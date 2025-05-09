using Application.Interface.ContextSerivce;
using Domain.Entities;
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
            if (post == null)
            {
                return ResponseFactory.Fail<bool>("Không tìm thấy bài viết này", 404);
            }

            await _unitOfWork.BeginTransactionAsync();
            try
            {
                await _postRepository.DeleteAsync(post.Id);
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
