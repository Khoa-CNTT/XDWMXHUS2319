using Application.Interface.Api;
using Application.Interface.SearchAI;
using Application.Model.SearchAI;
using Infrastructure.Qdrant.Model;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Services
{
    public abstract class BaseSearchService
    {
        protected readonly IDataAIService _dataAIService;
        protected readonly ICacheService _cacheService;
        protected readonly IGeminiService2 _geminiService;

        protected BaseSearchService(IDataAIService dataAIService, ICacheService cacheService, IGeminiService2 geminiService)
        {
            _dataAIService = dataAIService;
            _cacheService = cacheService;
            _geminiService = geminiService;
        }
        private static readonly Dictionary<string, string> KeywordMappings = new()
{
    {"Chào bạn","hi" },
    {"Chào","hi" },
    {"Hello bạn","hi" },
    {"Hello","hi" },
    {"Hi","hi" },      
    // Tìm kiếm bài viết chung (post)
    { "bài viết", "post" },
    { "bài post nào", "post" },
    { "đăng bài", "post" },
    { "nội dung", "post" },
    { "viết gì đó", "post" },
    { "bài đăng", "post" },
    { "status", "post" },
    { "cập nhật", "post" },
    { "chia sẻ bài viết", "post" },
    { "tâm sự", "post" },
    { "tin tức", "post" },
    { "post bài", "post" }, // Thêm biến thể
    { "đăng tin", "post" },
    { "lên bài", "post" },
    { "viết bài", "post" },
    { "gửi bài viết", "post" },

    // Tìm kiếm bài viết liên quan đến đi chung xe (ridepost)
    { "đi chung", "ridepost" },
    { "chuyến đi", "ridepost" },
    { "chuyến xe", "ridepost" },
    { "đặt xe", "ridepost" },
    { "tìm xe", "ridepost" },
    { "có ai đi", "ridepost" },
    { "ghép xe", "ridepost" },
    { "đi cùng", "ridepost" },
    { "tìm người đi cùng", "ridepost" },
    { "cần xe", "ridepost" },
    { "đi nhờ", "ridepost" },
    { "tìm chuyến", "ridepost" },
    { "xe trống", "ridepost" },
    { "di chuyển", "ridepost" },
    { "đi đến", "ridepost" },
    { "đi tới", "ridepost" },
    { "đi từ", "ridepost" },
    { "từ", "ridepost" },
    { "đến", "ridepost" },
    { "đi ké", "ridepost" }, // Thêm tiếng lóng
    { "share xe", "ridepost" },
    { "cùng đi", "ridepost" },
    { "tìm bạn đi", "ridepost" },
    { "xe rảnh", "ridepost" },
    { "đi ghép", "ridepost" },
    { "book xe", "ridepost" },
    { "tìm chỗ", "ridepost" },

    // Tìm kiếm tài xế hoặc người dùng (user)
    { "tài xế", "user" },
    { "người lái", "user" },
    { "ai lái", "user" },
    { "người dùng", "user" },
    { "hành khách", "user" },
    { "ai đăng", "user" },
    { "tìm người", "user" },
    { "ai vậy", "user" },
    { "thông tin người", "user" },
    { "ai là", "user" },
    { "điểm uy tín", "user" },
    { "độ uy tín", "user" },
    { "uy tín", "user" },
    { "sdt", "user" },
    { "số điện thoại", "user" },
    { "email", "user" },
    { "gmail", "user" },
    { "thông tin của tài xế", "user" },
    { "lái xe", "user" }, // Thêm biến thể
    { "khách đi", "user" },
    { "người đăng", "user" },
    { "danh tính", "user" },
    { "liên hệ", "user" },
    { "số dt", "user" },
    { "tài khoản", "user" },
    { "profile", "user" },

    // Tìm kiếm thông tin chung (general)
    { "tổng quan", "general" },
    { "mọi thứ", "general" },
    { "tất cả", "general" },
    { "gì cũng được", "general" },
    { "có gì", "general" },
    { "tìm kiếm chung", "general" },
    { "hệ thống", "general" },
    { "dữ liệu", "general" },
    { "toàn bộ", "general" }, // Thêm biến thể
    { "cái gì cũng ok", "general" },
    { "tổng hợp", "general" },
    { "xem hết", "general" },
    { "thông tin tổng", "general" },

    // Tìm kiếm chuyến đi thực tế (ride)
    { "chuyến đi thực tế", "ride" },
    { "xe đã chạy", "ride" },
    { "hành trình", "ride" },
    { "chuyến đi hoàn thành", "ride" },
    { "xe đang đi", "ride" },
    { "lịch sử chuyến", "ride" },
    { "đi xong", "ride" },
    { "xe đã ghép", "ride" },
    { "tình trạng chuyến", "ride" },
    { "chuyến đã đi", "ride" }, // Thêm biến thể
    { "xe hoàn tất", "ride" },
    { "đường đi", "ride" },
    { "trạng thái xe", "ride" },
    { "kết thúc chuyến", "ride" },

    // Đánh giá tài xế hoặc người dùng (rating)
    { "đánh giá", "rating" },
    { "phản hồi tài xế", "rating" },
    { "điểm số", "rating" },
    { "chấm điểm", "rating" },
    { "nhận xét", "rating" },
    { "ý kiến tài xế", "rating" },
    { "mức độ hài lòng", "rating" },
    { "review", "rating" },
    { "đánh giá chuyến", "rating" },
    { "bình chọn", "rating" }, // Thêm biến thể
    { "xếp hạng", "rating" },
    { "thái độ", "rating" },
    { "điểm tài xế", "rating" },
    { "phản hồi khách", "rating" },
    { "đánh giá sao", "rating" },

    // Bình luận bài viết (comment)
    { "bình luận", "comment" },
    { "ai comment", "comment" },
    { "góp ý", "comment" },
    { "phản hồi", "comment" },
    { "nói gì", "comment" },
    { "ý kiến", "comment" },
    { "trả lời", "comment" },
    { "viết bình luận", "comment" },
    { "thảo luận", "comment" },
    { "cmt", "comment" }, // Thêm tiếng lóng
    { "rep", "comment" },
    { "chat", "comment" },
    { "nói chuyện", "comment" },
    { "bàn luận", "comment" },

    // Báo cáo nội dung (report)
    { "báo cáo", "report" },
    { "spam", "report" },
    { "vi phạm", "report" },
    { "tố cáo", "report" },
    { "nội dung xấu", "report" },
    { "phàn nàn", "report" },
    { "báo lỗi", "report" },
    { "kiểm tra bài", "report" },
    { "báo xấu", "report" }, // Thêm biến thể
    { "nội dung không phù hợp", "report" },
    { "lừa đảo", "report" },
    { "fake", "report" },
    { "sai phạm", "report" },

    // Thích bài viết (like)
    { "thích", "like" },
    { "nhiều like", "like" },
    { "like bài", "like" },
    { "yêu thích", "like" },
    { "ai thích", "like" },
    { "thả tim", "like" },
    { "ủng hộ", "like" },
    { "bấm thích", "like" }, // Thêm biến thể
    { "thích bài viết", "like" },
    { "tương tác", "like" },
    { "vote", "like" },
    { "bao nhiêu", "like" },

    // Thích bình luận (likecomment)
    { "thích bình luận", "likecomment" },
    { "like comment", "likecomment" },
    { "yêu thích bình luận", "likecomment" },
    { "ai thích bình luận", "likecomment" },
    { "thả tim bình luận", "likecomment" },
    { "bấm thích cmt", "likecomment" }, // Thêm biến thể
    { "thích cmt", "likecomment" },
    { "vote bình luận", "likecomment" },

    // Chia sẻ bài viết (share)
    { "chia sẻ", "share" },
    { "share bài", "share" },
    { "lan tỏa", "share" },
    { "gửi bài", "share" },
    { "ai chia sẻ", "share" },
    { "đăng lại", "share" },
    { "repost", "share" }, // Thêm biến thể
    { "share lại", "share" },
    { "gửi cho", "share" },
    { "phổ biến", "share" },

    // Định vị người dùng (location)
    { "vị trí hiện tại", "location" },
    { "ở đâu", "location" },
    { "đang ở đâu", "location" },
    { "vị trí", "location" },
    { "tọa độ", "location" },
    { "định vị", "location" },
    { "nơi nào", "location" },
    { "vị trí tài xế", "location" },
    { "vị trí hành khách", "location" },
    { "chỗ nào", "location" }, // Thêm biến thể
    { "điểm hiện tại", "location" },
    { "khu vực", "location" },
    { "địa điểm", "location" },
    { "nơi ở", "location" },

    // Báo cáo chuyến đi (ridereport)
    { "báo cáo chuyến đi", "ridereport" },
    { "vấn đề chuyến", "ridereport" },
    { "tố cáo chuyến", "ridereport" },
    { "phàn nàn chuyến", "ridereport" },
    { "sự cố xe", "ridereport" },
    { "trễ chuyến", "ridereport" },
    { "không phản hồi", "ridereport" },
    { "tắt GPS", "ridereport" },
    { "lỗi chuyến", "ridereport" }, // Thêm biến thể
    { "xe hỏng", "ridereport" },
    { "tai nạn", "ridereport" },
    { "không đến", "ridereport" },
    { "bỏ chuyến", "ridereport" }
};
        protected string DetectQueryType(string query)
        {
            var typeMatches = new Dictionary<string, double>(); // Sử dụng double để tính điểm linh hoạt

            // Danh sách từ khóa chung để giảm điểm
            var commonKeywords = new HashSet<string> { "từ", "đến", "có", "cho", "tôi", "cần", "nhé" };

            // Chuyển query thành chữ thường để so sánh dễ dàng
            query = query.ToLowerInvariant();

            // Chia query thành các từ để xác định vị trí
            var queryWords = query.Split(' ', StringSplitOptions.RemoveEmptyEntries);
            int queryLength = queryWords.Length;

            foreach (var kvp in KeywordMappings)
            {
                if (query.Contains(kvp.Key, StringComparison.OrdinalIgnoreCase))
                {
                    // Tính điểm cơ bản dựa trên độ dài từ khóa
                    double baseScore = kvp.Key.Split(' ').Length; // Số từ trong cụm từ

                    // Giảm điểm nếu là từ khóa chung
                    if (commonKeywords.Contains(kvp.Key))
                    {
                        baseScore *= 0.5; // Giảm 50% điểm cho từ khóa chung
                    }

                    // Tăng điểm dựa trên vị trí xuất hiện (gần cuối câu thì quan trọng hơn)
                    int lastIndex = query.LastIndexOf(kvp.Key, StringComparison.OrdinalIgnoreCase);
                    double positionBonus = (double)lastIndex / query.Length; // Tỷ lệ vị trí trong chuỗi
                    double totalScore = baseScore * (1 + positionBonus); // Kết hợp điểm cơ bản và bonus vị trí

                    if (typeMatches.ContainsKey(kvp.Value))
                    {
                        typeMatches[kvp.Value] += totalScore;
                    }
                    else
                    {
                        typeMatches[kvp.Value] = totalScore;
                    }
                }
            }

            // Nếu không có từ khóa nào khớp, trả về "unknown"
            if (typeMatches.Count == 0)
            {
                return "unknown";
            }

            // Chọn type có điểm cao nhất
            var bestMatch = typeMatches.OrderByDescending(kvp => kvp.Value).First();
            return bestMatch.Key;
        }
        private static void AddKeywordToMappings(string keyword, string category)
        {
            if (!KeywordMappings.ContainsKey(keyword))
            {
                KeywordMappings[keyword] = category;
            }
        }

        protected async Task<string> ClassifyQueryUsingAIAsync(string query)
        {
            // Lưu category và keywords vào dictionary nếu chưa có
            var (category, keywordsString) = await _geminiService.ClassifyQueryAsync(query);
            var keywords = keywordsString.Split(new[] { ',', ';' }, StringSplitOptions.RemoveEmptyEntries);

            foreach (var keyword in keywords)
            {
                AddKeywordToMappings(keyword.Trim(), category);
            }
            return category;
        }

        // Lưu lịch sử tìm kiếm vào Redis (Key: "search_history:{userId}")
        protected async Task SaveSearchHistoryAsync(Guid userId, string query, List<SearchResult> results, string response, List<SearchHistoryItem> history)
        {
            var historyKey = $"chat_history:{userId}"; // Đồng bộ key với ProcessChatMessageAsync

            history.Add(new SearchHistoryItem
            {
                Query = query,
                Results = results,
                Response = response,
                Timestamp = DateTime.UtcNow
            });

            // Giới hạn lưu 10 lịch sử gần nhất
            if (history.Count > 10)
                history = history.Skip(history.Count - 10).ToList();

            await _cacheService.SetAsync(historyKey, history, TimeSpan.FromMinutes(30));
        }
        // Lấy lịch sử tìm kiếm gần nhất của user
        protected async Task<List<SearchResult>> GetLastSearchResultsAsync(Guid userId)
        {
            return await _cacheService.GetAsync<List<SearchResult>>($"search_history:{userId}") ?? new List<SearchResult>();
        }
    }

}
