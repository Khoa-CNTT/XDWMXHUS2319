using Application.DTOs.Shares;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Interface
{
    public interface IShareService
    {
        Task<GetSharedUsersResponse> GetSharedUsersByPostIdAsync(Guid postId, Guid? lastUserId, CancellationToken cancellationToken);
    }
}
