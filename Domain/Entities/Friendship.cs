using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using static Domain.Common.Enums;

namespace Domain.Entities
{
    public class Friendship
    {
        public Guid Id { get; private set; }
        public Guid UserId { get; private set; } // Không nên nullable, một quan hệ bạn bè cần có 2 người
        public Guid FriendId { get; private set; } // Không nên nullable
        public DateTime CreatedAt { get; private set; }
        public FriendshipStatusEnum Status { get; private set; } // Trạng thái kết bạn

        public Friendship(Guid userId, Guid friendId)
        {
            if (userId == Guid.Empty) throw new ArgumentException("UserId cannot be empty.");
            if (friendId == Guid.Empty) throw new ArgumentException("FriendId cannot be empty.");
            if (userId == friendId) throw new ArgumentException("UserId and FriendId cannot be the same.");

            Id = Guid.NewGuid();
            UserId = userId;
            FriendId = friendId;
            CreatedAt = DateTime.UtcNow;
            Status = FriendshipStatusEnum.Pending; // Mặc định là yêu cầu đang chờ
        }

        /// <summary>
        /// Xác nhận yêu cầu kết bạn
        /// </summary>
        public void Accept()
        {
            Status = FriendshipStatusEnum.Accepted;
        }

        /// <summary>
        /// Hủy hoặc từ chối yêu cầu kết bạn
        /// </summary>
        public void Reject()
        {
            Status = FriendshipStatusEnum.Rejected;
        }

        /// <summary>
        /// Hủy kết bạn
        /// </summary>
        public void Remove()
        {
            Status = FriendshipStatusEnum.Removed;
        }
        public void Reactivate()
        {
            if (Status == FriendshipStatusEnum.Removed)
            {
                Status = FriendshipStatusEnum.Pending;
                CreatedAt = DateTime.UtcNow;
            }
            else
            {
                throw new InvalidOperationException("Không thể kích hoạt lại lời mời kết bạn không ở trạng thái Removed.");
            }
        }
    }
}

