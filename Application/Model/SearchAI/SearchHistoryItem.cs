using Infrastructure.Qdrant.Model;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Model.SearchAI
{
    public class SearchHistoryItem
    {
        public string Query { get; set; } = string.Empty; // Câu hỏi của người dùng
        public List<SearchResult> Results { get; set; } = new List<SearchResult>();// Kết quả tìm kiếm tương ứng
        public string Response { get; set; } = string.Empty;
        public DateTime Timestamp { get; set; } // Thời gian thực hiện tìm kiếm
    }

}
