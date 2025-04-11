using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using static Domain.Common.Enums;

namespace Application.DTOs.FriendShips
{
    public class ResultSendFriendDto
    {
        public Guid Id { get;  set; }
        public Guid UserId { get;  set; } // Không nên nullable, một quan hệ bạn bè cần có 2 người
        public Guid FriendId { get;  set; } // Không nên nullable
        public required string CreatedAt { get;  set; }
        public FriendshipStatusEnum Status { get;  set; } // Trạng thái kết bạn
    }
}
