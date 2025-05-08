using Application.Model.SearchAI;
using Infrastructure.Qdrant.Model;

namespace Application.Services
{
    public class SearchAIService : BaseSearchService, ISearchAIService
    {
        private readonly IUserContextService _userContextService;
        private readonly IUnitOfWork _unitOfWork;
        private readonly IApiPythonService _apiPythonService;
        private readonly IPublisher _publisher;


        public SearchAIService(
            IDataAIService apiPythonService,
            ICacheService cacheService,
            IGeminiService2 geminiService,
            IApiPythonService embeddingService,
            IUnitOfWork unitOfWork,
            IUserContextService userContextService,
            IPublisher publisher)
            : base(apiPythonService, cacheService, geminiService)
        {
            _userContextService = userContextService;
            _unitOfWork = unitOfWork;
            _apiPythonService = embeddingService;
            _publisher = publisher;
        }
        // Hàm chính để xử lý tin nhắn trong chat
        public async Task<string> ProcessChatMessageAsync(string message, int topK = 5)
        {
            Guid userId = _userContextService.UserId();
            string queryType = DetectQueryType(message);
            // Xử lý các trường hợp đặc biệt (hi, communicate)
            var specialResponse = await HandleSpecialQueryAsync(userId, message, queryType);
            if (specialResponse != null)
            {
                return specialResponse; // Thoát hàm nếu xử lý xong
            }
            var history = await _cacheService.GetAsync<List<SearchHistoryItem>>($"chat_history:{userId}") ?? new List<SearchHistoryItem>();


            if (!history.Any())
            {
                return await SearchAsync(userId, message, topK, history, queryType);
            }

            var lastItem = history.Last();
            var lastQuery = lastItem.Query;
            var lastVectorResults = lastItem.Results;
            var lastResponse = lastItem.Response;

            // Bước 1: So sánh với vectorResults cũ
            var relevantResult = await CheckRelevantVectorResultAsync(message, lastVectorResults);
            if (relevantResult != null && !string.IsNullOrEmpty(relevantResult.Content))
            {
                var (detailedContent, oldId) = await GetDetailedResultAsync(relevantResult);

                // Tạo SearchResult mới từ detailedContent để truyền vào ContinueSearchAsync
                if (!string.IsNullOrEmpty(detailedContent))
                {
                    var detailedResult = new SearchResult
                    {
                        Id = oldId, // Giữ Id cũ từ relevantResult
                        Content = detailedContent,
                        Score = relevantResult.Score, // Giữ score cũ
                        Type = relevantResult.Type // Giữ type cũ
                    };

                    // Truyền detailedResult vào ContinueSearchAsync để thêm vào vectorResults trong SearchAsync
                    return await ContinueSearchAsync(userId, message, lastQuery, topK, history, queryType, detailedResult);
                }
            }

            // Bước 2: So sánh với câu hỏi trước
            var querySimilarity = await CalculateSimilarityAsync(lastQuery, message);
            if (querySimilarity > 0.6)
            {
                return await ContinueSearchAsync(userId, message, lastQuery, topK, history, queryType);
            }

            // Bước 3: So sánh với phản hồi của Gemini
            var responseSimilarity = await CalculateSimilarityAsync(lastResponse, message);
            if (responseSimilarity > 0.6)
            {
                return await SearchAsync(userId, $"{lastResponse} {message}", topK, history, queryType);
            }

            // Bước 4: Coi như câu hỏi mới
            return await SearchAsync(userId, message, topK, history, queryType);
        }
        private async Task<string> SearchAsync(Guid userId, string query, int topK, List<SearchHistoryItem> history, string queryType, SearchResult? additionalResult = null)
        {

            var response = "";
            if (queryType == "unknown")
            {
                queryType = await ClassifyQueryUsingAIAsync(query);
            }
            response = "Xin lỗi, tôi không tìm thấy thông tin phù hợp với câu hỏi của bạn.";
            var vectorResults = await _dataAIService.SearchVectorAsync(query, queryType, topK);
            // Thêm additionalResult vào vectorResults nếu có
            if (additionalResult != null && !vectorResults.Any(r => r.Id == additionalResult.Id))
            {
                vectorResults.Add(additionalResult);
            }

            if (!vectorResults.Any())
            {
                await SaveSearchHistoryAsync(userId, query, vectorResults, response, history);
                return response;
            }

            var detailedResults = new List<string>();
            foreach (var result in vectorResults)
            {
                var (content, _) = await GetDetailedResultAsync(result); // Chỉ lấy content từ tuple
                if (!string.IsNullOrEmpty(content))
                {
                    detailedResults.Add(content);
                }
            }

            var resultSummary = string.Join("\n", detailedResults);
            if (string.IsNullOrEmpty(resultSummary))
            {
                await SaveSearchHistoryAsync(userId, query, vectorResults, response, history);
                return response;
            }

            response = await _geminiService.GenerateNaturalResponseAsync(query, resultSummary);
            await SaveSearchHistoryAsync(userId, query, vectorResults, response, history);
            await _publisher.Publish(new SearchAIEvent(userId, query, response));
            return response;
        }
        private async Task<(string content, Guid OldId)> GetDetailedResultAsync(SearchResult result)
        {
            var id = result.Id;
            var type = result.Type.ToLower();
            var content = result.Content;

            if (string.IsNullOrEmpty(type))
            {
                return (content ?? "Không tìm thấy thông tin chi tiết.", Guid.Empty);
            }

            // Dictionary ánh xạ type với cách lấy dữ liệu và định dạng
            var typeHandlers = new Dictionary<string, Func<Guid, Task<string>>>()
            {
                ["ridepost"] = async id =>
                {
                    var ridePost = await _unitOfWork.RidePostRepository.GetByIdAsync(id);
                    if (ridePost == null) return "Không tìm thấy chuyến đi.";
                    var driver = await _unitOfWork.UserRepository.GetByIdAsync(ridePost.UserId);
                    return $"🚗 Chuyến đi từ {ridePost.StartLocation} đến {ridePost.EndLocation}, khởi hành {ridePost.StartTime}, tài xế {driver?.FullName ?? "N/A"} (điểm uy tín: {driver?.TrustScore ?? 0})";
                },
                ["user"] = async id =>
                {
                    var user = await _unitOfWork.UserRepository.GetByIdAsync(id);
                    return user != null
                        ? $"👤 Người dùng: {user.FullName}, email: {user.Email}, bio: {user.Bio ?? "N/A"}, điểm uy tín: {user.TrustScore}"
                        : "Không tìm thấy người dùng.";
                },
                ["post"] = async id =>
                {
                    var post = await _unitOfWork.PostRepository.GetByIdAsync(id);
                    if (post == null) return "Không tìm thấy bài viết.";
                    var name = await _unitOfWork.UserRepository.GetFullNameByIdAsync(post.UserId);
                    return $"📝 Bài viết: \"{post.Content}\" của {name ?? "N/A"}, loại: {post.PostType}";
                },
                ["ride"] = async id =>
                {
                    var ride = await _unitOfWork.RideRepository.GetByIdAsync(id);
                    if (ride == null) return "Không tìm thấy chuyến đi thực tế.";
                    var driver = await _unitOfWork.UserRepository.GetFullNameByIdAsync(ride.DriverId);
                    var passenger = await _unitOfWork.UserRepository.GetFullNameByIdAsync(ride.PassengerId);
                    return $"🚙 Chuyến đi: tài xế {driver ?? "N/A"}, hành khách {passenger ?? "N/A"}, bắt đầu: {ride.StartTime}, trạng thái: {ride.Status}, giá: {ride.Fare ?? 0} VND";
                },
                ["rating"] = async id =>
                {
                    var rating = await _unitOfWork.RatingRepository.GetByIdAsync(id);
                    if (rating == null) return "Không tìm thấy đánh giá.";
                    var user = await _unitOfWork.UserRepository.GetFullNameByIdAsync(rating.UserId);
                    var rater = await _unitOfWork.UserRepository.GetFullNameByIdAsync(rating.RatedByUserId);
                    return $"⭐ Đánh giá: {rater ?? "N/A"} đánh giá {user ?? "N/A"} mức {rating.Level}/4, bình luận: {rating.Comment ?? "Không có"}";
                },
                ["comment"] = async id =>
                {
                    var comment = await _unitOfWork.CommentRepository.GetByIdAsync(id);
                    if (comment == null) return "Không tìm thấy bình luận.";
                    var user = await _unitOfWork.UserRepository.GetFullNameByIdAsync(comment.UserId);
                    return $"💬 Bình luận: \"{comment.Content}\" của {user ?? "N/A"} trên bài viết {comment.PostId}";
                },
                ["report"] = async id =>
                {
                    var report = await _unitOfWork.ReportRepository.GetByIdAsync(id);
                    if (report == null) return "Không tìm thấy báo cáo.";
                    var reporter = await _unitOfWork.UserRepository.GetFullNameByIdAsync(report.ReportedBy);
                    return $"⚠️ Báo cáo: {reporter ?? "N/A"} báo cáo bài viết {report.PostId}, lý do: {report.Reason}, trạng thái: {report.Status}";
                },
                ["like"] = async id =>
                {
                    var like = await _unitOfWork.LikeRepository.GetByIdAsync(id);
                    if (like == null) return "Không tìm thấy lượt thích.";
                    var user = await _unitOfWork.UserRepository.GetFullNameByIdAsync(like.UserId);
                    return $"❤️ Lượt thích: {user ?? "N/A"} thích bài viết {like.PostId}";
                },
                ["likecomment"] = async id =>
                {
                    var likeComment = await _unitOfWork.CommentLikeRepository.GetByIdAsync(id);
                    if (likeComment == null) return "Không tìm thấy lượt thích bình luận.";
                    var user = await _unitOfWork.UserRepository.GetFullNameByIdAsync(likeComment.UserId);
                    return $"❤️ Thích bình luận: {user ?? "N/A"} thích bình luận {likeComment.CommentId}";
                },
                ["share"] = async id =>
                {
                    var share = await _unitOfWork.ShareRepository.GetByIdAsync(id);
                    if (share == null) return "Không tìm thấy lượt chia sẻ.";
                    var user = await _unitOfWork.UserRepository.GetFullNameByIdAsync(share.UserId);
                    return $"📤 Chia sẻ: {user ?? "N/A"} chia sẻ bài viết {share.PostId}";
                },
                ["location"] = async id =>
                {
                    var location = await _unitOfWork.LocationUpdateRepository.GetByIdAsync(id);
                    if (location == null) return "Không tìm thấy vị trí.";
                    var user = await _unitOfWork.UserRepository.GetFullNameByIdAsync(location.UserId);
                    return $"📍 Vị trí: {(location.IsDriver ? "Tài xế" : "Hành khách")} {user ?? "N/A"} tại ({location.Latitude}, {location.Longitude}), tốc độ: {location.Speed ?? 0}m/s";
                },
                ["ridereport"] = async id =>
                {
                    var rideReport = await _unitOfWork.RideReportRepository.GetByIdAsync(id);
                    if (rideReport == null) return "Không tìm thấy báo cáo chuyến đi.";
                    var passenger = await _unitOfWork.UserRepository.GetFullNameByIdAsync(rideReport.PassengerId);
                    return $"🚨 Báo cáo chuyến đi: {passenger ?? "N/A"} báo cáo chuyến {rideReport.RideId}, nội dung: {rideReport.Message}, loại: {rideReport.AlertType}, trạng thái: {(rideReport.Status ? "Đã xử lý" : "Chưa xử lý")}";
                }
            };

            if (typeHandlers.TryGetValue(type, out var handler))
            {
                return (await (handler(result.Id)), id);
            }

            return (content ?? "Không tìm thấy thông tin chi tiết.", Guid.Empty);
        }

        private async Task<string> ContinueSearchAsync(Guid userId, string newQuery, string lastQuery, int topK, List<SearchHistoryItem> history, string queryType, SearchResult? additionalResult = null)
        {
            // Gộp truy vấn cũ và mới để giữ ngữ cảnh
            string combinedQuery = $"{lastQuery} {newQuery}";
            return await SearchAsync(userId, combinedQuery, topK, history, queryType, additionalResult);
        }
        private async Task<double> CalculateSimilarityAsync(string text1, string text2)
        {
            // Tạo embedding cho hai chuỗi
            var embedding1 = await _apiPythonService.GetEmbeddingAsync(text1);
            var embedding2 = await _apiPythonService.GetEmbeddingAsync(text2);

            if (embedding1 == null || embedding2 == null || embedding1.Length == 0 || embedding2.Length == 0)
            {
                return 0.0; // Trả về 0 nếu không tạo được embedding
            }

            // Tính tích vô hướng (dot product)
            double dotProduct = embedding1.Zip(embedding2, (a, b) => a * b).Sum();

            // Tính độ dài vector (norm)
            double norm1 = Math.Sqrt(embedding1.Sum(x => x * x));
            double norm2 = Math.Sqrt(embedding2.Sum(x => x * x));

            // Tính Cosine Similarity
            if (norm1 == 0 || norm2 == 0)
            {
                return 0.0; // Tránh chia cho 0
            }

            return dotProduct / (norm1 * norm2);
        }
        private async Task<SearchResult> CheckRelevantVectorResultAsync(string message, List<SearchResult> lastVectorResults)
        {
            SearchResult bestMatch = new SearchResult();
            double bestSimilarity = double.MinValue; // Khởi tạo với giá trị nhỏ nhất để đảm bảo bất kỳ similarity nào cũng lớn hơn

            foreach (var result in lastVectorResults)
            {
                var content = result.Content.ToLower();
                if (content != null)
                {
                    var similarity = await CalculateSimilarityAsync(message.ToLower(), content);
                    if (similarity > 0.3) // Chỉ cần lớn hơn bestSimilarity hiện tại
                    {
                        bestMatch = new SearchResult { Id = result.Id, Score = result.Score, Content = result.Content, Type = result.Type };
                        bestSimilarity = similarity;
                    }
                }
            }

            return bestMatch;
        }
        private static readonly string[] Greetings =
{
    "Chào bạn! Tôi có thể giúp gì cho bạn?",
    "Xin chào! Bạn cần hỗ trợ gì hôm nay?",
    "Hello! Tôi có thể giúp bạn tìm kiếm thông tin gì?",
    "Chào bạn, tôi có thể hỗ trợ bạn như thế nào?",
    "Hey! Bạn đang tìm kiếm thông tin gì nhỉ?",
    "Xin chào, hôm nay bạn cần giúp đỡ gì không?",
    "Chào bạn, tôi có thể hỗ trợ gì cho bạn hôm nay?",
    "Chào mừng bạn! Tôi sẵn sàng hỗ trợ bạn ngay!",
    "Hello! Bạn muốn tìm kiếm điều gì?",
    "Xin chào! Cần tôi giúp đỡ gì không?"
};

        private string GetRandomGreeting()
        {
            var random = new Random();
            return Greetings[random.Next(Greetings.Length)];
        }
    
    // Hàm mới để xử lý hai trường hợp đặc biệt
    private async Task<string?> HandleSpecialQueryAsync(Guid userId, string message, string queryType)
        {
            if (queryType == "hi")
            {
                var response = await _geminiService.GenerateNaturalResponseAsync(message, GetRandomGreeting());
                await _publisher.Publish(new SearchAIEvent(userId, message, response.Trim()));
                return response;
            }

            if (queryType.Contains("communicate"))
            {
                var response = await _geminiService.GenerateNaturalResponseAsync(message, "");
                await _publisher.Publish(new SearchAIEvent(userId, message, response));
                return response;
            }

            return null; // Trả về null nếu không khớp
        }
    }
}
