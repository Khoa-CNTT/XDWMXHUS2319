using Application.DTOs.CommentLikes;
using Application.DTOs.Post;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.CQRS.Queries.CommentLike
{
    public class GetCommentLikeQueryHandle : IRequestHandler<GetCommentLikeQuery, ResponseModel<List<CommentLikeDto>>>
    {
        private readonly IUnitOfWork _unitOfWork;

        public GetCommentLikeQueryHandle(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public async Task<ResponseModel<List<CommentLikeDto>>> Handle(GetCommentLikeQuery request, CancellationToken cancellationToken)
        {
            var likeCount = await _unitOfWork.CommentLikeRepository.CountLikesAsync(request.CommentId);
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

            return ResponseFactory.Success(new List<CommentLikeDto> { commentLikeDto }, "Lấy danh sách người đã like bình luận thành công", 200);
        }
    }
}
