using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Infrastructure.ApiPython.Model
{
    public class SearchResponse
    {
        public List<SearchResultItem> Results { get; set; } = new List<SearchResultItem>();
    }

    public class SearchResultItem
    {
        public string Id { get; set; } = string.Empty;
        public float Score { get; set; }
        public string Content { get; set; } = string.Empty; // Nếu muốn trả về nội dung
        public string Type { get; set; } = string.Empty; // Nếu muốn kiểm tra type
    }
}
