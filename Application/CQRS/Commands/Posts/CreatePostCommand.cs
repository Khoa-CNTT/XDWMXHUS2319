using Application.DTOs.Post;
using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using static Domain.Common.Enums;

namespace Application.CQRS.Commands.Posts
{
    public class CreatePostCommand : IRequest<ResponseModel<ResponsePostDto>>
    {
        public required string Content { get;  set; }
        public List<IFormFile>? Images { get; set; } // ✅ hỗ trợ nhiều ảnh
        public IFormFile? Video { get;  set; }
        public PostTypeEnum PostType { get;  set; }
        public ScopeEnum Scope { get;  set; }
    }
}
