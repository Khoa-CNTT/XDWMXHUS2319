using Application.DTOs.Likes;
using Application.DTOs.Post;
using Application.DTOs.User;
using Application.Model.Events;
using Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Services
{
    public class LikeService : ILikeService
    {
        private readonly IUnitOfWork _unitOfWork;

        public LikeService(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }
        public async Task<GetLikeWithCursorResponse> GetLikesByPostIdWithCursorAsync(Guid postId, Guid? lastUserId)
        {
            const string baseUrl = "https://localhost:7053";
            int pageSize = 2; // 📌 Set cứng lấy 2 người mỗi lần

            var (likes, nextCursor) = await _unitOfWork.LikeRepository.GetLikesByPostIdWithCursorAsync(postId, lastUserId, pageSize);
            int likeCount = await _unitOfWork.LikeRepository.CountLikesByPostIdAsync(postId);

            var likedUserDtos = likes
                .Select(l => new UserPostDto
                {
                    UserId = l.User!.Id,
                    UserName = l.User.FullName,
                    ProfilePicture = l.User.ProfilePicture != null ? $"{baseUrl}{l.User.ProfilePicture}" : null, // ✅ Thêm Base URL
                }).ToList();

            return new GetLikeWithCursorResponse
            {
                LikeCount = likeCount,
                LikedUsers = likedUserDtos,
                NextCursor = nextCursor
            };
        }
    }
}
