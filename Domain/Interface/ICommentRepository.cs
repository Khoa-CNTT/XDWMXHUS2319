using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Text;
using System.Threading.Tasks;

namespace Domain.Interface
{
    public interface ICommentRepository : IBaseRepository<Comment>
    {
/*        Task<IEnumerable<Comment>> GetCommentByPostIdAsync(Guid postId);*/
        Task<int> CountPostCommentAsync(Expression<Func<Comment, bool>> predicate);
        Task<Comment?> GetCommentByIdAsync(Guid commentId);
        //lấy các comment mà user đã bình luận
        Task<List<Comment>> GetAllCommentByUserIdAsync(Guid userId);
        Task<List<Comment>> GetReplysCommentAllAsync(Guid parentCommentId);
        Task<(List<Comment>, int)> GetCommentByPostIdAsync(Guid postId, int page, int pageSize);
        Task<List<Comment>> GetCommentsByPostIdDeleteAsync(Guid postId);
        Task<List<Comment>> GetRepliesByCommentIdAsync(Guid parentCommentId);

        Task<int> GetCommentCountAsync(Guid userId);

        Task<int> CountRepliesAsync(Guid parentCommentId);
        bool HasMoreReplies(Guid commentId);
        Task<Guid> GetCommentOwnerIdAsync(Guid commentId);
        Task<List<Comment>> GetRepliesByCommentIdWithCursorAsync(Guid parentCommentId, Guid? lastReplyId, int pageSize, CancellationToken cancellationToken);
        Task<List<Comment>> GetCommentsByPostIdWithCursorAsync(Guid postId, Guid? lastCommentId, int pageSize, CancellationToken cancellationToken);

    }
}
