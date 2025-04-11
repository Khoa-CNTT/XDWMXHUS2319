using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using static Domain.Common.Enums;

namespace Application.DTOs.FriendShips
{
    public class FriendDto
    {
        public Guid FriendId { get; set; }
        public string? PictureProfile { get; set; }
        public required string FullName { get; set; }
        public FriendshipStatusEnum Status { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}
