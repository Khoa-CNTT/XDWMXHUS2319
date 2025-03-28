using Application.DTOs.CommentLikes;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Interface
{
    public interface ICommentLikeService
    {
        Task<GetCommentLikeWithCursorResponse> GetLikedUsersWithCursorAsync(Guid commentId, Guid? lastUserId);
        Task<int> CountCommentLikesAsync(Guid commentId);
    }
}
