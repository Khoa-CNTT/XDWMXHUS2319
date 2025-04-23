using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Domain.Interface
{
    public interface IFriendshipRepository : IBaseRepository<Friendship>
    {
        Task<List<Friendship>> GetFriendsAsync(Guid userId);
        Task<List<Friendship>> GetFriendsCursorAsync(Guid userId, DateTime? cursor, int pageSize, CancellationToken cancellationToken = default);
        Task<List<Friendship>> GetReceivedRequestsAsync(Guid userId);
        Task<List<Friendship>> GetSentRequestsAsync(Guid userId);
        Task<List<Friendship>> GetReceivedRequestsCursorAsync(Guid userId, DateTime? cursor, int take, CancellationToken cancellationToken);
        Task<List<Friendship>> GetSentRequestsCursorAsync(Guid userId, DateTime? cursor, int take, CancellationToken cancellationToken);
        Task<Friendship?> GetFriendshipAsync(Guid userId1, Guid userId2);
        Task<Friendship?> GetPendingRequestAsync(Guid senderId, Guid receiverId);
        Task<bool> ExistsAsync(Guid userId, Guid friendId, CancellationToken cancellationToken = default);
        Task<int> CountAcceptedFriendsAsync(Guid userId);
    }
}
