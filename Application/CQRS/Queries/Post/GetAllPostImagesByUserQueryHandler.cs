using Application.DTOs.Post;
using Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using static System.Net.Mime.MediaTypeNames;

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

                var allPostImages = new List<PostImageDto>();

                foreach (var post in posts)
                {
                    if (!string.IsNullOrEmpty(post.ImageUrl))
                    {
                        // Tách chuỗi ImageUrl thành mảng các URL
                        var imageUrls = post.ImageUrl.Split(',')
                            .Select(url => url.Trim())
                            .Where(url => !string.IsNullOrEmpty(url));

                        foreach (var imageUrl in imageUrls)
                        {
                            // Kiểm tra file tồn tại
                            var filePath = Path.Combine(_env.ContentRootPath, "wwwroot", "images", "posts", Path.GetFileName(imageUrl));
                            if (File.Exists(filePath))
                            {
                                allPostImages.Add(new PostImageDto
                                {
                                    PostId = post.Id,
                                    ImageUrl = $"{Constaint.baseUrl}{imageUrl}"
                                });
                            }
                        }
                    }
                }

                return allPostImages;
            }
        }
    }

