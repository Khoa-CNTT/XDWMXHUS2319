using Application.DTOs.Shares;
using Application.DTOs.User;
using Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Services
{
    public class ShareService : IShareService
    {
        private readonly IUnitOfWork _unitOfWork;
        public ShareService(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }
        public async Task<GetSharedUsersResponse> GetSharedUsersByPostIdAsync(Guid postId, Guid? lastUserId, CancellationToken cancellationToken)
        {
            const string baseUrl = " https://localhost:7053";
            const int PAGE_SIZE = 10; // 🔥 Số lượng phần tử mỗi lần lấy

            // Lấy nhiều hơn 1 phần tử để kiểm tra còn dữ liệu hay không
            var sharedUsers = await _unitOfWork.ShareRepository.GetSharedUsersByPostIdWithCursorAsync(postId, lastUserId, PAGE_SIZE + 1, cancellationToken);

            if (sharedUsers == null || !sharedUsers.Any())
            {
                return new GetSharedUsersResponse(); // Không có dữ liệu
            }

            // 🔥 Lọc trùng dựa trên Id người dùng
            var distinctUsers = sharedUsers.GroupBy(u => u.User.Id)
                                           .Select(g => g.First())
                                           .ToList();

            // Kiểm tra còn dữ liệu hay không
            bool hasMoreData = distinctUsers.Count > PAGE_SIZE;

            // Chỉ lấy PAGE_SIZE user
            var userDtos = distinctUsers.Take(PAGE_SIZE).Select(s => new GetUserShareDto
            {
                Id = s.User.Id,
                FullName = s.User.FullName,
                ProfilePicture = s.User.ProfilePicture != null ? $"{baseUrl}{s.User.ProfilePicture}" : null, // ✅ Thêm Base URL
                Email = s.User.Email,
            }).ToList();

            // Nếu còn dữ liệu thì đặt NextCursor, ngược lại thì đặt null
            var nextCursor = hasMoreData ? (Guid?)userDtos.Last().Id : null;

            return new GetSharedUsersResponse
            {
                Users = userDtos,
                NextCursor = nextCursor
            };
        }
    }
}
