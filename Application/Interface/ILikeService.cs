using Application.DTOs.Likes;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Interface
{
    public interface ILikeService
    {
        Task<GetLikeWithCursorResponse> GetLikesByPostIdWithCursorAsync(Guid postId, Guid? lastUserId);
    }
}
