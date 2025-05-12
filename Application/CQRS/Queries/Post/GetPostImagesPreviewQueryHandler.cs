using Application.DTOs.Post;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.CQRS.Queries.Post
{
    public class GetPostImagesPreviewQueryHandler : IRequestHandler<GetPostImagesPreviewQuery, List<PostImageDto>>
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IHostEnvironment _env;

        public GetPostImagesPreviewQueryHandler(IUnitOfWork unitOfWork, IHostEnvironment env)
        {
            _unitOfWork = unitOfWork;
            _env = env;
        }

        public async Task<List<PostImageDto>> Handle(GetPostImagesPreviewQuery request, CancellationToken cancellationToken)
        {
            var posts = await _unitOfWork.PostRepository
                 .GetTopPostImagesByUserAsync(request.UserId, 3);

            if (posts == null || !posts.Any())
            {
                return new List<PostImageDto>();
            }

            var previewImages = new List<PostImageDto>();

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
                        if (File.Exists(filePath) && previewImages.Count < 3)
                        {
                            previewImages.Add(new PostImageDto
                            {
                                PostId = post.Id,
                                ImageUrl = $"{Constaint.baseUrl}{imageUrl}"
                            });

                            // Giới hạn tối đa 3 hình ảnh
                            if (previewImages.Count >= 3)
                                break;
                        }
                    }

                    // Thoát vòng lặp post nếu đã đủ 3 hình ảnh
                    if (previewImages.Count >= 3)
                        break;
                }
            }

            return previewImages;
        }
    }
}
