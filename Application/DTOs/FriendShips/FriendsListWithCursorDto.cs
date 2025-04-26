using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.DTOs.FriendShips
{
    public class FriendsListWithCursorDto
    {
        public int CountFriend { get; set; }
        public List<FriendDto> Friends { get; set; } = new();
        public DateTime? NextCursor { get; set; }
    }
}
