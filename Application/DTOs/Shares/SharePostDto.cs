using Application.DTOs.Post;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.DTOs.Shares
{
    public class SharePostDto
    {
        public Guid ShareId { get; set; }
        public DateTime SharedAt { get; set; }
        public string? Content { get; set; }
        public UserPostDto? User { get; set; }
        public OriginalPostDto? OriginalPost { get; set; }
    }
}
