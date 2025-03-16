using Application.DTOs.Post;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.CQRS.Queries.Post
{
    public class GetPostForTrainingMLQueriesHandler : IRequestHandler<GetPostForTrainingMLQueries, ResponseModel<IEnumerable<GetPostForTrainingDto>>>
    {
        private readonly IPostRepository _postRepository;
        public GetPostForTrainingMLQueriesHandler(IPostRepository postRepository)
        {
            _postRepository = postRepository;
        }
        public async Task<ResponseModel<IEnumerable<GetPostForTrainingDto>>> Handle(GetPostForTrainingMLQueries request, CancellationToken cancellationToken)
        {
            var posts = await _postRepository.GetPostsByApprovalStatusAsync(request.ApprovalStatus);

            // Kiểm tra nếu danh sách rỗng
            if (!posts.Any())
            {
                return ResponseFactory.Fail<IEnumerable<GetPostForTrainingDto>>("No posts found", 404);
            }

            // Mapping dữ liệu từ Post sang GetPostForTrainingDto
            var postDtos = posts.Select(post => new GetPostForTrainingDto
            {
                Id = post.Id,
                UserId = post.UserId,
                Content = post.Content,
                CreatedAt = post.CreatedAt,
                IsApproved = post.IsApproved,
                ApprovalStatus = post.ApprovalStatus

            });

            return ResponseFactory.Success(postDtos,"Get data ss",200);
        }

    }
}
