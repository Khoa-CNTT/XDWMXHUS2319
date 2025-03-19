using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.DTOs.Shares
{
    public class ShareDto
    {
        public Guid UserId { get; set; }
        public string? UserName { get; set; }
        public string? ProfilePicture { get; set; }
        public DateTime SharedAt { get; set; }
    }
}
