using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.DTOs.Post
{
    public class PostImageDto
    {
        public Guid PostId { get; set; }
        public string ImageUrl { get; set; } = string.Empty;
    }
}
