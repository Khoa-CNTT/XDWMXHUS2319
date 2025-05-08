using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.DTOs.Post
{
    public class GetPostsResponse
    {
        public List<GetAllPostDto> Posts { get; set; } = new();
        public Guid? NextCursor { get; set; } // ID bài cuối cùng trong danh sách
    }

}
