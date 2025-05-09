using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.DTOs.Post
{
    public class GetPostsResponseAdminDto
    {
        public List<PostAdminDto> Posts { get; set; } = new();
        public int TotalCount { get; set; }
    }
}
