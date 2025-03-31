using Application.DTOs.CommentLikes;
using Application.DTOs.Post;
using Domain.Interface;
using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Services
{
    public class CommentLikeService : ICommentLikeService
    {
        private readonly IUnitOfWork _unitOfWork;
        public CommentLikeService(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }
        public async Task<GetCommentLikeWithCursorResponse> GetLikedUsersWithCursorAsync(Guid commentId, Guid? lastUserId)
        {
            var (likedUsers, nextCursor) = await _unitOfWork.CommentLikeRepository.GetLikedUsersWithCursorAsync(commentId, lastUserId);
            int likeCount = await _unitOfWork.CommentLikeRepository.CountLikesAsync(commentId);
            var likedUserDtos = likedUsers.Select(user => new UserPostDto
            {
                UserId = user.Id,
                UserName = user.FullName,
                ProfilePicture = user.ProfilePicture
            }).ToList();

            return new GetCommentLikeWithCursorResponse
            {
                LikeCount = likeCount,
                LikedUsers = likedUserDtos,
                NextCursor = nextCursor
            };
        }

        public async Task<int> CountCommentLikesAsync(Guid commentId)
        {
            return await _unitOfWork.CommentLikeRepository.CountLikesAsync(commentId);
        }

    }
}

