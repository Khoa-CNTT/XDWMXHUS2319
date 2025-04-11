using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.DTOs.FriendShips
{
    public class FriendNotificationDto
    {
        public string Message { get; set; } = null!;
        public string Avatar { get; set; } = null!;
        public string Url { get; set; } = null!;
    }
}
