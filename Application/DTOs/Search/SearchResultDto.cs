using Application.DTOs.Posts;
using Application.DTOs.User;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.DTOs.Search
{
    public class SearchResultDto
    {
        public List<PostDto> Posts { get; set; } = new List<PostDto>();
        public List<UserDto> Users { get; set; } = new List<UserDto>();
    }
}
