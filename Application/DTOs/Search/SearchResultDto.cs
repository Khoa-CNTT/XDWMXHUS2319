using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.DTOs.Search
{
    public class SearchResultDto
    {
        public Guid Id { get; set; }
        public float Score { get; set; }
        public string Type { get; set; } = string.Empty; // "ridepost" hoặc "post"
        public string Content { get; set; } = string.Empty; // Nội dung chi tiết
        public object Data { get; set; } // Thêm thuộc tính Data (kiểu object để linh hoạt)
    }
}
