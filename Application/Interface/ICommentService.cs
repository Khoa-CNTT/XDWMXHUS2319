using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Interface
{
    public interface ICommentService
    {
        Task<bool> SoftDeleteCommentWithRepliesAndLikesAsync(Guid commentId);
        Task<Guid> GetCommentOwnerId(Guid commentId);
    }
}
