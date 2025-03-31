using Application.DTOs.Post;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.CQRS.Queries.Post
{
    public class GetPostByIdQueriesHandler : IRequestHandler<GetPostByIdQueries, ResponseModel<GetAllPostDto>>
    {
        private readonly IPostRepository _postRepository;
        public GetPostByIdQueriesHandler(IPostRepository postRepository)
        {
            _postRepository = postRepository;
        }
        public async Task<ResponseModel<GetAllPostDto>> Handle(GetPostByIdQueries request, CancellationToken cancellationToken)
        {
            
            var post = await _postRepository.GetByIdAsync(request.Id);
            if (post == null)
            {
                return ResponseFactory.Fail<GetAllPostDto>("Post not found", 404);
            }
            var postDto = Mapping.MapToAllPostDto(post,post.UserId);
            return ResponseFactory.Success(postDto, "Get post success", 200);
        }
    }
}
