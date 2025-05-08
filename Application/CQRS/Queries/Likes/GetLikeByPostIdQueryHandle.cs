using Application.DTOs.Likes;
using Application.DTOs.Post;
using Application.DTOs.User;
using Domain.Interface;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.CQRS.Queries.Likes
{
    public class GetLikeByPostIdQueryHandle : IRequestHandler<GetLikeByPostIdQuery, ResponseModel<GetLikeWithCursorResponse>>
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly ILikeService _likeService;

        public GetLikeByPostIdQueryHandle(IUnitOfWork unitOfWork, ILikeService likeService)
        {
            _unitOfWork = unitOfWork;
            _likeService = likeService;
        }

            public async Task<ResponseModel<GetLikeWithCursorResponse>> Handle(GetLikeByPostIdQuery request, CancellationToken cancellationToken)
            {
            var response = await _likeService.GetLikesByPostIdWithCursorAsync(request.PostId, request.LastUserId);

            if (response == null || !response.LikedUsers.Any()) // Kiểm tra response hợp lệ
            {
                return ResponseFactory.Success(new GetLikeWithCursorResponse
                {
                    LikeCount = 0,
                    LikedUsers = new List<UserPostDto>(),
                    NextCursor = null
                }, "Không có lượt like nào", 200);
            }

            return ResponseFactory.Success(response, "Lấy danh sách like thành công", 200);
        }
    }
}
