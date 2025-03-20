using Application.DTOs.Comments;
using Application.DTOs.Likes;
using Application.DTOs.Posts;
using Application.DTOs.Shares;
using Domain.Interface;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.CQRS.Queries.Posts
{
    public class GetAllPostQueryHandle : IRequestHandler<GetAllPostQuery, ResponseModel<List<PostDto>>>
    {
        private readonly IUnitOfWork _unitOfWork;
        public GetAllPostQueryHandle(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public async Task<ResponseModel<List<PostDto>>> Handle(GetAllPostQuery request, CancellationToken cancellationToken)
        {
            var posts = await _unitOfWork.PostRepository.GetAllPostsAsync(cancellationToken);
            if(posts == null)
            {
                return ResponseFactory.Success<List<PostDto>>("Không tìm thấy bài viết nào", 404);
            }

            var postDtos = posts.Select(Mapping.MapToPostDto).ToList();

            return ResponseFactory.Success(postDtos, "Lấy tất cả bài viết thành công", 200);
        }
    }
}

