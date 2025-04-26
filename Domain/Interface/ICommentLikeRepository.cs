using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Domain.Interface
{
    public interface ICommentLikeRepository : IBaseRepository<CommentLike>
    {
        Task<CommentLike?> GetLikeAsync(Guid userId, Guid commentId);
        Task<bool> CheckLikeComment(Guid commentId, Guid userId);
        Task<int> CountLikesAsync(Guid commentId);
        Task<List<User>> GetLikedUsersAsync(Guid commentId);
        Task<List<User?>> GetLikedByCommentIdAsync(Guid commentId);
        Task<List<CommentLike>> GetCommentLikeByCommentIdAsync(Guid CommentId);
        Task<(List<User>, Guid?)> GetLikedUsersWithCursorAsync(Guid commentId, Guid? lastUserId);
        Task<List<CommentLike>> GetLikesByCommentIdsAsync(List<Guid> commentIds);
    }
}
