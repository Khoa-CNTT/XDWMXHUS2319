using Application.DTOs.Comments;
using Application.DTOs.Shares;
using Application.DTOs.User;
using Domain.Interface;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.CQRS.Queries.Shares
{
    public class GetSharesByPostIdQueryHandle : IRequestHandler<GetSharesByPostIdQuery, ResponseModel<List<UserDto>>>
    {
        private readonly IUnitOfWork _unitOfWork;

        public GetSharesByPostIdQueryHandle(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public async Task<ResponseModel<List<UserDto>>> Handle(GetSharesByPostIdQuery request, CancellationToken cancellationToken)
        {
            var shares = await _unitOfWork.ShareRepository.GetSharesByPostIdAsync(request.PostId, request.Page, request.PageSize);

            if (shares == null || !shares.Any())
            {
                return ResponseFactory.Success(new List<UserDto>(), "Không có lượt chia sẻ nào", 200);
            }

            var shareDtos = shares.Select(s => new UserDto
            {
                Id = s.User.Id,
                FullName = s.User.FullName,
                ProfilePicture = s.User.ProfilePicture,
            }).ToList();

            return ResponseFactory.Success(shareDtos, "Lấy danh sách like thành công", 200);
        }
    }
}
