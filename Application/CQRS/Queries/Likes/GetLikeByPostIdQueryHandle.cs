using Application.DTOs.User;
using Domain.Interface;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.CQRS.Queries.Likes
{
    public class GetLikeByPostIdQueryHandle : IRequestHandler<GetLikeByPostIdQuery, ResponseModel<List<UserDto>>>
    {
        private readonly IUnitOfWork _unitOfWork;

        public GetLikeByPostIdQueryHandle(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

            public async Task<ResponseModel<List<UserDto>>> Handle(GetLikeByPostIdQuery request, CancellationToken cancellationToken)
            {
                var likes = await _unitOfWork.LikeRepository.GetLikesByPostIdAsync(request.PostId, request.Page, request.PageSize);

                if (likes == null || !likes.Any())
                {
                    return ResponseFactory.Success(new List<UserDto>(), "Không có lượt like nào", 200);
                }

                var likeDtos = likes.Select(l => l.User.MapToUserDto()).ToList();

                return ResponseFactory.Success(likeDtos, "Lấy danh sách like thành công", 200);
            }
    }
}
