using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.DTOs.Likes
{
    public class LikeDto
    {
        public Guid UserId { get; set; }
        public string? UserName { get; set; }
        public string? ProfilePicture { get; set; }
    }
}
