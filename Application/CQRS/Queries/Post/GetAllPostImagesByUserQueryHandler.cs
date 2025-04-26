using Application.DTOs.Post;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.CQRS.Queries.Post
{
    internal class GetAllPostImagesByUserQueryHandler : IRequestHandler<GetAllPostImagesByUserQuery, List<PostImageDto>>
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IHostEnvironment _env;
        public GetAllPostImagesByUserQueryHandler(IUnitOfWork unitOfWork , IHostEnvironment env)
        {
            _unitOfWork = unitOfWork;
            _env = env;
        }

        public async Task<List<PostImageDto>> Handle(GetAllPostImagesByUserQuery request, CancellationToken cancellationToken)
        {
            var posts = await _unitOfWork.PostRepository
                .GetPostImagesByUserAsync(request.UserId);

            if (posts == null || !posts.Any())
            {
                return new List<PostImageDto>();
            }

            var allposts = posts
                .Where(p =>
                    !string.IsNullOrEmpty(p.ImageUrl) &&
                    File.Exists(Path.Combine(_env.ContentRootPath, "wwwroot", "images", "posts", Path.GetFileName(p.ImageUrl)))
                )
                .Select(p => new PostImageDto
                {
                    PostId = p.Id,
                    ImageUrl = $"{Constaint.baseUrl}{p.ImageUrl}"
                })
                .ToList();

            return allposts;
        }
    }
}
