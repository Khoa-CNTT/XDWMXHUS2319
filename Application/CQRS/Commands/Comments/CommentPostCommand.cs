using Application.DTOs.Comments;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.CQRS.Commands.Comments
{
    public class CommentPostCommand : IRequest<ResponseModel<ResultCommentDto>>
    {
        public Guid PostId { get; set; }
        public string? Content { get; set; }
        public string? redis_key { get; set; } = string.Empty;
    }
}
