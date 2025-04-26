using Application.DTOs.Post;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.CQRS.Queries.Post
{
    public class GetPostImagesPreviewQuery : IRequest<List<PostImageDto>>
    {
        public Guid UserId { get; set; }
    }
}
