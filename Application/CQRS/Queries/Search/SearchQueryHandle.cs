using Application.DTOs.Comments;
using Application.DTOs.Likes;
using Application.DTOs.Post;
using Application.DTOs.Posts;
using Application.DTOs.Shares;
using Application.DTOs.User;
using Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.CQRS.Queries.Search
{
    public class SearchQueryHandle : IRequestHandler<SearchQuery, ResponseModel<List<SearchResultDto>>>
    {
        private readonly IUnitOfWork _unitOfWork;
        public SearchQueryHandle(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }
        public async Task<ResponseModel<List<SearchResultDto>>> Handle(SearchQuery request, CancellationToken cancellationToken)
        {
            var results = new List<SearchResultDto>();

            // 🔹 Tìm kiếm User
            var users = (await _unitOfWork.UserRepository.SearchUsersAsync(request.Keyword))
                .Select(u => new SearchResultDto
                {
                    Type = "User",
                    Data = new UserSearchDto
                    {
                        UserId = u.Id,
                        FullName = u.FullName,
                        AvatarUrl = u.ProfilePicture,
                        Email = u.Email
                    }
                }).ToList();

            if (users.Count == 0)
            {
                results.Add(new SearchResultDto
                {
                    Type = "User",
                    Data = "Không có dữ liệu người dùng nào."
                });
            }
            else
            {
                results.AddRange(users);
            }

            // 🔹 Tìm kiếm Post
            var posts = (await _unitOfWork.PostRepository.SearchPostsAsync(request.Keyword))
                .Select(p => new SearchResultDto
                {
                    Type = "Post",
                    Data = Mapping.MapToPostDto(p)
                }).ToList();

            if (posts.Count == 0)
            {
                results.Add(new SearchResultDto
                {
                    Type = "Post",
                    Data = "Không có dữ liệu bài viết nào."
                });
            }
            else
            {
                results.AddRange(posts);
            }

            // 🔹 Tìm kiếm Share
            var shares = (await _unitOfWork.ShareRepository.SearchSharesAsync(request.Keyword))
                .Select(s => new SearchResultDto
                {
                    Type = "Share",
                    Data = Mapping.MapToSharePostDto(s, s.Post, s.User)
                }).ToList();

            if (shares.Count == 0)
            {
                results.Add(new SearchResultDto
                {
                    Type = "Share",
                    Data = "Không có dữ liệu bài chia sẻ nào."
                });
            }
            else
            {
                results.AddRange(shares);
            }

            return ResponseFactory.Success(results, "Tìm kiếm thành công", 200);

        }
    }
}
