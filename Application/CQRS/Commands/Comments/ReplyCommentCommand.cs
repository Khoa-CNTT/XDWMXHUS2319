using Application.DTOs.Comments;
using Application.Interface.ContextSerivce;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.CQRS.Commands.Comments
{
    public class ReplyCommentCommand : IRequest<ResponseModel<ResultCommentDto>>
    {
        public Guid PostId { get; set; }
        public Guid ParentCommentId { get; set; } // Nếu null → là comment gốc, nếu có giá trị → là reply
        public string Content { get; set; } = string.Empty;
    }
}
