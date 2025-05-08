using Application.DTOs.Search;
using Application.DTOs.User;
using Application.Interface.ContextSerivce;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Services
{
    public class SearchService : ISearchService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IUserContextService _userContextService;
        public SearchService(IUnitOfWork unitOfWork, IUserContextService userContextService)
        {
            _unitOfWork = unitOfWork;
            _userContextService = userContextService;
        }
        

        public async Task<List<SearchResultDto>> SearchPostsAsync(string keyword)
        {
            var userId = _userContextService.UserId();
            var posts = await _unitOfWork.PostRepository.SearchPostsAsync(keyword);
            return posts.Any()
                ? posts.Select(p => new SearchResultDto
                {
                    Type = "Post",
                    Data = Mapping.MapToAllPostDto(p, userId)  // ✅ Đóng gói PostDto vào SearchResultDto
                }).ToList()
                : new List<SearchResultDto> { new SearchResultDto { Type = "Post", Data = "Không có dữ liệu bài viết nào." } };
        }

        public async Task<List<SearchResultDto>> SearchUsersAsync(string keyword)
        {

            var user = await _unitOfWork.UserRepository.SearchUsersAsync(keyword);
            return user.Any()
               ? user.Select(u => new SearchResultDto
               {
                   Type = "User",
                   Data = Mapping.MapToUserDto(u)  // ✅ Đóng gói UserDto vào SearchResultDto
               }).ToList()
                : new List<SearchResultDto> { new SearchResultDto { Type = "User", Data = "Không có dữ liệu người dùng nào." } };
        }
    }
}
