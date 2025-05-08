using Application.DTOs.Comments;
using Application.DTOs.Likes;
using Application.DTOs.Post;
using Application.DTOs.Posts;
using Application.DTOs.Search;
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

        private readonly ISearchService _searchService;

        public SearchQueryHandle(ISearchService searchService)
        {
            _searchService = searchService;
        }

        public async Task<ResponseModel<List<SearchResultDto>>> Handle(SearchQuery request, CancellationToken cancellationToken)
        {
            var users = await _searchService.SearchUsersAsync(request.Keyword);
            var posts = await _searchService.SearchPostsAsync(request.Keyword);

            var results = users.Concat(posts).ToList(); // ✅ Kết hợp kết quả tìm kiếm người dùng và bài viết

            return ResponseFactory.Success(results, "Tìm kiếm thành công", 200);
        }
    }
}
