using Application.DTOs.CommentLikes;
using Application.DTOs.Post;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.CQRS.Queries.CommentLike
{
    public class GetCommentLikeQueryHandle : IRequestHandler<GetCommentLikeQuery, ResponseModel<GetCommentLikeWithCursorResponse>>
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly ICommentLikeService _commentLikeService;

        public GetCommentLikeQueryHandle(IUnitOfWork unitOfWork, ICommentLikeService commentLikeService)
        {
            _unitOfWork = unitOfWork;
            _commentLikeService = commentLikeService;
        }

        public async Task<ResponseModel<GetCommentLikeWithCursorResponse>> Handle(GetCommentLikeQuery request, CancellationToken cancellationToken)
        {
            /*var likeCount = await _unitOfWork.CommentLikeRepository.CountLikesAsync(request.CommentId);
            var likedUsers = await _unitOfWork.CommentLikeRepository.GetLikedUsersAsync(request.CommentId);

            // Kiểm tra nếu danh sách user bị null hoặc rỗng
            if (likedUsers == null || !likedUsers.Any())
            {
                return ResponseFactory.Success(new List<CommentLikeDto>(), "Không có ai đã like bình luận này", 200);
            }

            // Map từ User → UserPostDto
            var likedUserDtos = likedUsers.Select(user => new UserPostDto(user)).ToList();

            var commentLikeDto = new CommentLikeDto
            {
                LikeCount = likeCount,
                LikedUsers = likedUserDtos
            };

            return ResponseFactory.Success(new List<CommentLikeDto> { commentLikeDto }, "Lấy danh sách người đã like bình luận thành công", 200);*/
            var response = await _commentLikeService.GetLikedUsersWithCursorAsync(request.CommentId, request.LastUserId);

            return ResponseFactory.Success(response, "Lấy danh sách người đã like thành công", 200);
        }
    }
}
