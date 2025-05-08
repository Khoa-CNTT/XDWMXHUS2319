using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.DTOs.DasbroadAdmin
{
    public class DashboardPostDto
    {
        public Guid Id { get;  set; }
        public Guid UserId { get;  set; }
        public string? Content { get; set; }
        public int TotalPostsWithComments { get; set; }
        public int TotalPostsWithLikes { get; set; }
        public int TotalPostsWithShares { get; set; }
        public DateTime CreatedAt { get;  set; }
    }
}
