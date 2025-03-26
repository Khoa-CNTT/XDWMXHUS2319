﻿using System;
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
        Task<List<Comment>> GetReplysCommentAllAsync(Guid parentCommentId);
        Task<(List<Comment>, int)> GetCommentByPostIdAsync(Guid postId, int page, int pageSize);
        Task<List<Comment>> GetCommentsByPostIdDeleteAsync(Guid postId);
        Task<List<Comment>> GetRepliesByCommentIdAsync(Guid parentCommentId);
        Task<int> CountRepliesAsync(Guid parentCommentId);
        bool HasMoreReplies(Guid commentId);
        Task<List<Comment>> GetRepliesByCommentIdWithCursorAsync(Guid parentCommentId, Guid? lastReplyId, int pageSize, CancellationToken cancellationToken);
        Task<List<Comment>> GetCommentsByPostIdWithCursorAsync(Guid postId, Guid? lastCommentId, int pageSize, CancellationToken cancellationToken);
    }
}
