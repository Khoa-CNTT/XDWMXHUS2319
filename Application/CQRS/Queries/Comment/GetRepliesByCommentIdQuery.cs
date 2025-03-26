using Application.DTOs.Comments;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.CQRS.Queries.Comment
{
    public class GetRepliesByCommentIdQuery : IRequest<ResponseModel<GetRepliesResponse>>
    {
        public Guid ParentCommentId { get; set; } // 🔥 ID của comment cha
        public Guid? LastReplyId { get; set; } // 🔥 ID của reply cuối cùng (dùng để load thêm)
        public int PageSize { get; set; } = 5; // 🔥 Mặc định lấy 5 reply mỗi lần
        public GetRepliesByCommentIdQuery() { }
        public GetRepliesByCommentIdQuery(Guid parentCommentId, Guid? lastReplyId, int pageSize = 5)
        {
            ParentCommentId = parentCommentId;
            LastReplyId = lastReplyId;
            PageSize = pageSize;
        }
    }
}
