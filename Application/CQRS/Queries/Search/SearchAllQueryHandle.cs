/*
using Application.DTOs.Posts;
using Application.DTOs.Search;
using Application.DTOs.User;


namespace Application.CQRS.Queries.Search
{
    public class SearchAllQueryHandle : IRequestHandler<SearchAllQuery, ResponseModel<List<SearchResultDto>>>
    {
        private readonly IUserRepository _userRepository;
        private readonly IPostRepository _postRepository;


        public SearchAllQueryHandle(IUserRepository userRepository, IPostRepository postRepository)
        {
            _userRepository = userRepository;
            _postRepository = postRepository;
        }


        public async Task<ResponseModel<List<DTOs.Search.SearchResultDto>>> Handle(SearchAllQuery request, CancellationToken cancellationToken)
        {

            var results = new List<SearchResultDto>();

            // Kiểm tra nếu cả OnlyUsers và OnlyPosts cùng true thì trả về lỗi
            if (request.OnlyUsers == true && request.OnlyPosts == true)
            {
                return ResponseFactory.Fail<List<SearchResultDto>>("Chỉ có thể chọn lọc theo người dùng HOẶC bài đăng.", 400);
            }


            List<UserDto> userResults = new();
            List<PostDto> postResults = new();

            if (request.OnlyUsers == true)
            {
                // Chỉ tìm người dùng
                var users = await _userRepository.SearchUsersAsync(request.Keyword);
                userResults = users.Select(Mapping.MapToUserDto).ToList();
            }
            else if (request.OnlyPosts == true)
            {
                // Chỉ tìm bài đăng
                var posts = await _postRepository.SearchPostsAsync(request.Keyword, request.FromDate, request.ToDate, request.Year, request.Month, request.Day);
                postResults = posts.Select(Mapping.MapToPostDto).ToList();
            }
            else
            {
                // Nếu không chọn OnlyUsers hoặc OnlyPosts, tìm cả hai
                var users = await _userRepository.SearchUsersAsync(request.Keyword);
                userResults = users.Select(Mapping.MapToUserDto).ToList();

                var posts = await _postRepository.SearchPostsAsync(request.Keyword, request.FromDate, request.ToDate, request.Year, request.Month, request.Day);
                postResults = posts.Select(Mapping.MapToPostDto).ToList();
            }

            // Nếu không có kết quả nào
            if (!userResults.Any() && !postResults.Any())
            {
                return ResponseFactory.Fail<List<SearchResultDto>>("Không tìm thấy kết quả nào theo tiêu chí lọc.", 404);
            }

            // Xác định thông báo kết quả
            string message = "Tìm kiếm thành công.";
            if (!userResults.Any()) message = "Không tìm thấy người dùng nào, nhưng có bài đăng liên quan.";
            if (!postResults.Any()) message = "Không tìm thấy bài đăng nào, nhưng có người dùng liên quan.";

            results.Add(new SearchResultDto
            {
                Users = userResults,
                Posts = postResults
            });

            return ResponseFactory.Success(results, message, 200);
        }


    }
}
*/