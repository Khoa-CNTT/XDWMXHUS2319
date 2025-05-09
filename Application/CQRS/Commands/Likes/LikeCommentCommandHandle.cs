using Application.Interface.ContextSerivce;
using Application.Model.Events;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.CQRS.Commands.Likes
{
    public class LikeCommentCommandHandle : IRequestHandler<LikeCommentCommand, ResponseModel<bool>>
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IRedisService _redisService;
        private readonly INotificationService _notificationService;
        private readonly IUserContextService _userContextService;

        public LikeCommentCommandHandle(IUnitOfWork unitOfWork, IUserContextService userContextService, IRedisService redisService, INotificationService notificationService)
        {
            _unitOfWork = unitOfWork;
            _userContextService = userContextService;
            _redisService = redisService;
            _notificationService = notificationService;
        }

        public async Task<ResponseModel<bool>> Handle(LikeCommentCommand request, CancellationToken cancellationToken)
        {
            // Kiểm tra comment có tồn tại không
            var userId = _userContextService.UserId();
            // Tìm comment theo id
            var comment = await _unitOfWork.CommentRepository.GetByIdAsync(request.CommentId);
            //Kiểm tra comment có tồn tại không
            if (comment == null)
            {
                return ResponseFactory.Fail<bool>("Comment không tồn tại!", 404);
            }
            //Kiểm tra post có tồn tại không
            var post = await _unitOfWork.PostRepository.GetByIdAsync(comment.PostId);
            if (post == null || post.Id == Guid.Empty)
            {
                return ResponseFactory.Fail<bool>("Không tìm thấy bài viết chứa bình luận này!", 404);
            }
            try
            {
                string redisKey = "likeComment_events";
                var likeEvent = new CommentLike(userId, request.CommentId);
                bool isAdded = await _redisService.AddAsync(redisKey, likeEvent, TimeSpan.FromMinutes(10));
                if (isAdded)
                {

                    if (request.redis_key != null)
                    {
                        var key = $"{request.redis_key}";
                        await _redisService.RemoveAsync(key);
                    }

                    await _notificationService.SendLikeComentNotificationAsync(post.Id, request.CommentId, userId);
                    return ResponseFactory.Success<bool>("Like/unlike request đã được lưu, sẽ xử lý sau", 202);   
                }
                return ResponseFactory.Fail<bool>("Không thể lưu like comment vào Redis", 500);
            }
            catch (Exception ex)
            {
                return ResponseFactory.Fail<bool>(ex.Message, 500);
            } 
        }
    }
}
