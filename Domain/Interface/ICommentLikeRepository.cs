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
        Task<int> CountLikesAsync(Guid commentId);
        Task<List<User>> GetLikedUsersAsync(Guid commentId);
    }
}
