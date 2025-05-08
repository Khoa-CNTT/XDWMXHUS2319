using Application.DTOs.Likes;
using Application.DTOs.User;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.CQRS.Queries.Likes
{
    public class GetLikeByPostIdQuery : IRequest<ResponseModel<GetLikeWithCursorResponse>>
    {
        public Guid PostId { get; set; }
        public Guid? LastUserId { get; set; }
        public GetLikeByPostIdQuery() { }

        public GetLikeByPostIdQuery(Guid postId, Guid? lastUserId = null)
        {
            PostId = postId;
            LastUserId = lastUserId;
        }

    }
}
