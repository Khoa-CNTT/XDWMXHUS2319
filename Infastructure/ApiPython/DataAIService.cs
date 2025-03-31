
using Application.Interface.Api;
using Application.Interface.SearchAI;
using Infrastructure.Qdrant.Model;
using System.Net.Http.Json;
using System.Text.Json;
using static Domain.Common.Enums;


namespace Infrastructure.ApiPython
{
    public class DataAIService : IDataAIService
    {
        private readonly IApiPythonService _embeddingService;
        private readonly IUnitOfWork _unitOfWork;
        private readonly HttpClient _httpClient;
        private readonly IMapService _mapService;

        public DataAIService(
            IApiPythonService togetherAIService,
            IUnitOfWork unitOfWork,
            HttpClient httpClient,
            IMapService mapService)
        {
            _embeddingService = togetherAIService;
            _unitOfWork = unitOfWork;
            _httpClient = new HttpClient { BaseAddress = new Uri("http://127.0.0.1:8000") };
            _mapService = mapService;
        }

        public async Task<List<SearchResult>> SearchVectorAsync(string query, string queryType, int topK = 5)
        {
            if (string.IsNullOrWhiteSpace(query))
            {
                throw new ArgumentException("Query không được để trống.");
            }

            // Tạo embedding từ query
            var vector = await _embeddingService.GetEmbeddingAsync(query);
            if (vector == null || vector.Length == 0)
            {
                throw new InvalidOperationException("Embedding không hợp lệ hoặc không có dữ liệu.");
            }

            // Chuẩn bị request gửi đến API Python
            var request = new
            {
                query_embedding = vector,
                query_type = queryType, // Lọc theo type
                top_k = topK
            };

            // Gọi API Python để tìm kiếm trong ChromaDB
            var response = await _httpClient.PostAsJsonAsync("/search", request);

            if (!response.IsSuccessStatusCode)
            {
                var errorContent = await response.Content.ReadAsStringAsync();
                throw new Exception($"Failed to search vector: {response.StatusCode}, {errorContent}");
            }

            var responseContent = await response.Content.ReadAsStringAsync();
            // Thêm tùy chọn không phân biệt chữ hoa/thường
            var options = new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true // Bỏ qua case của property
            };
            var searchResults = JsonSerializer.Deserialize<Model.SearchResponse>(responseContent, options);

            if (searchResults == null || searchResults.Results.Count == 0)
            {
                Console.WriteLine("Không tìm thấy kết quả phù hợp.");
                return new List<SearchResult>();
            }
           

            if (searchResults == null || searchResults.Results == null || !searchResults.Results.Any())
            {
                Console.WriteLine("Không tìm thấy kết quả phù hợp.");
                return new List<SearchResult>();
            }

            // Chuyển đổi kết quả từ API thành List<SearchResult>
            return searchResults.Results.Select(r => new SearchResult
            {
                Id = Guid.Parse(r.Id), // Chuyển Id từ chuỗi về Guid
                Score = r.Score,
                Type = r.Type,
                Content = r.Content
            }).ToList();
        }
   
        public async Task ImportAllDataAsync()
        {
            try
            {
                // Lấy dữ liệu từ các bảng
                var ridePosts = await _unitOfWork.RidePostRepository.GetAllRidePostForSearchAI();
                var posts = await _unitOfWork.PostRepository.GetAllPostForSearchAI();
                var users = await _unitOfWork.UserRepository.GetAllUsersAsync();
                var ratings = await _unitOfWork.RatingRepository.GetAllAsync();
                var comments = await _unitOfWork.CommentRepository.GetAllAsync();
                var reports = await _unitOfWork.ReportRepository.GetAllAsync();
                var likes = await _unitOfWork.LikeRepository.GetAllAsync();
                var likeComments = await _unitOfWork.CommentLikeRepository.GetAllAsync();
                var shares = await _unitOfWork.ShareRepository.GetAllAsync();
                var locations = await _unitOfWork.LocationUpdateRepository.GetAllAsync();
                var rides = await _unitOfWork.RideRepository.GetAllAsync();
                var rideReports = await _unitOfWork.RideReportRepository.GetAllAsync();


                // Lấy tất cả ID hiện có trong ChromaDB qua API Python
                var existingIds = new HashSet<string>();
                var response = await _httpClient.GetAsync("/get-ids"); // Gọi API mới để lấy ID từ ChromaDB
                if (response.IsSuccessStatusCode)
                {
                    var idsJson = await response.Content.ReadAsStringAsync();
                    var ids = JsonSerializer.Deserialize<string[]>(idsJson);
                    if (ids != null)
                    {
                        existingIds = new HashSet<string>(ids);
                    }
                }
                else
                {
                    Console.WriteLine("Failed to fetch existing IDs from ChromaDB. Assuming empty collection.");
                }

                Console.WriteLine($"Found {existingIds.Count} existing items in ChromaDB.");

                // Nhập Users
                foreach (var user in users)
                {
                    var content = $"Người dùng {user.FullName}, email: {user.Email}, bio: {user.Bio},số điện thoại: {user.Phone}, điểm uy tín: {user.TrustScore}";
                    var vector = await _embeddingService.GetEmbeddingAsync(content);
                    await _embeddingService.StoreVectorAsync(user.Id.ToString(), vector, "user", content);
                    Console.WriteLine($"Imported/Updated user: {user.Id}");
                }

                // Nhập RidePosts
                foreach (var ridePost in ridePosts)
                {
                    var user = await _unitOfWork.UserRepository.GetByIdAsync(ridePost.UserId);
                    if (user == null) continue;
                    var content = $"Chuyến đi từ {ridePost.StartLocation} đến {ridePost.EndLocation}, khởi hành {ridePost.StartTime}, tài xế {user.FullName},nội dung: {ridePost.Content} trạng thái: {(ridePost.Status == 0 ? "Đang mở" : ridePost.Status == RidePostStatusEnum.Matched ? "Đã ghép" : "Đã hủy")},link bài post: https://localhost:7053/api/ridepost/get-by-id?id={ridePost.Id}";
                    var vector = await _embeddingService.GetEmbeddingAsync(content);
                    await _embeddingService.StoreVectorAsync(ridePost.Id.ToString(), vector, "ridepost", content);
                    Console.WriteLine($"Imported ridePost: {ridePost.Id}");
                }

                // Nhập Posts
                foreach (var post in posts)
                {
                    var user = await _unitOfWork.UserRepository.GetByIdAsync(post.UserId);
                    if (user == null) continue;
                    var content = $"Bài viết của {user?.FullName ?? "người dùng ẩn danh"},nội dung: {post.Content}, loại: {post.PostType},Đăng vào lúc: {post.CreatedAt},link bài post: https://localhost:7053/api/post/get-by-id?id={post.Id}";
                    var vector = await _embeddingService.GetEmbeddingAsync(content);
                    await _embeddingService.StoreVectorAsync(post.Id.ToString(), vector, "post", content);
                    Console.WriteLine($"Imported post: {post.Id}");
                }

                // Nhập Rides
                foreach (var ride in rides)
                {
                    var driver = await _unitOfWork.UserRepository.GetByIdAsync(ride.DriverId);
                    var passenger = await _unitOfWork.UserRepository.GetByIdAsync(ride.PassengerId);
                    var content = $"Chuyến đi thực tế của tài xế {driver?.FullName ?? "người dùng ẩn danh"} với hành khách {passenger?.FullName ?? "người dùng ẩn danh"}, bắt đầu {ride.StartTime},kết thúc: {ride.EndTime},thời gian di chuyển ước tính: {ride.EstimatedDuration},với giá {ride.Fare}, trạng thái: {ride.Status switch { 0 => "Pending", StatusRideEnum.Accepted => "Accepted", StatusRideEnum.Completed => "Completed", StatusRideEnum.Rejected => "Rejected", _ => "Cancelled" }}, giá: {ride.Fare ?? 0} VND";
                    var vector = await _embeddingService.GetEmbeddingAsync(content);
                    await _embeddingService.StoreVectorAsync(ride.Id.ToString(), vector, "ride", content);
                    Console.WriteLine($"Imported ride: {ride.Id}");
                }

                // Nhập Ratings
                foreach (var rating in ratings)
                {
                    var user = await _unitOfWork.UserRepository.GetByIdAsync(rating.UserId);
                    var rater = await _unitOfWork.UserRepository.GetByIdAsync(rating.RatedByUserId);
                    var content = $"{rater?.FullName ?? "người dùng ẩn danh"} đánh giá {user?.FullName ?? "người dùng ẩn danh"} mức {rating.Level}/4, bình luận: {rating.Comment ?? "Không có"}";
                    var vector = await _embeddingService.GetEmbeddingAsync(content);
                    await _embeddingService.StoreVectorAsync(rating.Id.ToString(), vector, "rating", content);
                    Console.WriteLine($"Imported rating: {rating.Id}");
                }

                //// Nhập Comments
                foreach (var comment in comments)
                {
                    var user = await _unitOfWork.UserRepository.GetByIdAsync(comment.UserId);
                    var content = $"Bình luận của {user?.FullName ?? "người dùng ẩn danh"}: {comment.Content} trên bài viết {comment.PostId} vào lúc {comment.CreatedAt}";
                    var vector = await _embeddingService.GetEmbeddingAsync(content);
                    await _embeddingService.StoreVectorAsync(comment.Id.ToString(), vector, "comment", content);
                    Console.WriteLine($"Imported comment: {comment.Id}");
                }

                //// Nhập Reports
                foreach (var report in reports)
                {
                    var reporter = await _unitOfWork.UserRepository.GetByIdAsync(report.ReportedBy);
                    var content = $"{reporter?.FullName ?? "người dùng ẩn danh"} báo cáo bài viết {report.PostId}, lý do: {report.Reason}, trạng thái: {report.Status} vào lúc {report.CreatedAt} trạng thái {report.Status switch { ReportStatusEnum.Pending => "Đang chờ", ReportStatusEnum.Reviewed =>"tố cáo sai", _=>"tố cáo đúng" }}";
                    var vector = await _embeddingService.GetEmbeddingAsync(content);
                    await _embeddingService.StoreVectorAsync(report.Id.ToString(), vector, "report", content);
                    Console.WriteLine($"Imported report: {report.Id}");
                }

                //// Nhập Likes
                foreach (var like in likes)
                {
                    var user = await _unitOfWork.UserRepository.GetByIdAsync(like.UserId);
                    var content = $"{user?.FullName ?? "người dùng ẩn danh"} thích bài viết {like.PostId} vào lúc {like.CreatedAt}";
                    var vector = await _embeddingService.GetEmbeddingAsync(content);
                    await _embeddingService.StoreVectorAsync(like.Id.ToString(), vector, "like", content);
                    Console.WriteLine($"Imported like: {like.Id}");
                }


                //// Nhập Shares
                foreach (var share in shares)
                {
                    var user = await _unitOfWork.UserRepository.GetByIdAsync(share.UserId);
                    var content = $"{user?.FullName ?? "người dùng ẩn danh"} chia sẻ bài viết {share.PostId}, nội dung {share.Content} vào lúc {share.CreatedAt} link bài share link bài post: https://localhost:7053/api/share/get-by-id?id={share.Id}";
                    var vector = await _embeddingService.GetEmbeddingAsync(content);
                    await _embeddingService.StoreVectorAsync(share.Id.ToString(), vector, "share", content);
                    Console.WriteLine($"Imported share: {share.Id}");
                }
                //nhaapk location
                if (locations == null || locations.Count() == 0) return;

                List<int> selectedIndexes;
                if (locations.Count() <= 5)
                {
                    selectedIndexes = Enumerable.Range(0, locations.Count()).ToList();
                }
                else
                {
                    selectedIndexes = new List<int> { 0, 1, locations.Count() / 2, locations.Count() - 2, locations.Count()  - 1 };
                }

                foreach (var index in selectedIndexes)
                {
                    var location = locations[index];

                    var user = await _unitOfWork.UserRepository.GetByIdAsync(location.UserId);
                    var ridePost = await _unitOfWork.RidePostRepository.GetByIdAsync(location.RideId);
                    var here = await _mapService.GetAddressFromCoordinatesAsync(location.Latitude, location.Longitude);

                    if (user == null || ridePost == null) continue;

                    var content = $"{(location.IsDriver ? "Tài xế" : "Hành khách")} {user?.FullName ?? "người dùng ẩn danh"} đã ở tại ({here}) vào lúc {location.Timestamp}, tốc độ: {location.Speed ?? 0}m/s, link chuyến đi: link bài post: https://localhost:7053/api/ridepost/get-by-id?id={ridePost.Id}";

                    var vector = await _embeddingService.GetEmbeddingAsync(content);
                    await _embeddingService.StoreVectorAsync(location.Id.ToString(), vector, "location", content);

                    Console.WriteLine($"Imported location: {location.Id}");
                }


                //// Nhập RideReports
                foreach (var rideReport in rideReports)
                {
                    var passenger = await _unitOfWork.UserRepository.GetByIdAsync(rideReport.PassengerId);
                    var content = $"{passenger?.FullName ?? "người dùng ẩn danh"} báo cáo chuyến đi {rideReport.RideId}, nội dung: {rideReport.Message}, loại: {rideReport.AlertType switch { AlertTypeEnums.DriverGPSOff => "DriverGPSOff", AlertTypeEnums.TripDelayed => "TripDelayed", _ => "NoResponse" }}, trạng thái: {(rideReport.Status ? "Đã xử lý" : "Chưa xử lý")} vào lúc {rideReport.CreatedAt}";
                    var vector = await _embeddingService.GetEmbeddingAsync(content);
                    await _embeddingService.StoreVectorAsync(rideReport.Id.ToString(), vector, "ridereport", content);
                    Console.WriteLine($"Imported rideReport: {rideReport.Id}");
                }

                Console.WriteLine("Data import completed.");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error during import: {ex.Message}");
                throw;
            }
        }
       

    }
}
