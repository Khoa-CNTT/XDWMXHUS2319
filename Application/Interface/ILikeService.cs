using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Interface
{
    public interface ILikeService
    {
        Task<bool> AddLikeAsync(Guid userId, Guid postId);
    }
}
