/*using Application.DTOs.Search;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.CQRS.Queries.Search
{
    public class SearchAllQuery : IRequest<ResponseModel<List<SearchResultDto2>>>
    {
        public string Keyword { get; set; }
        public SearchAllQuery(string keyword) => Keyword = keyword;
        // Thêm các tùy chọn lọc
        // ⚡ Thêm constructor mặc định
        public SearchAllQuery() { }

        // Constructor có tham số sẵn
        public SearchAllQuery(string keyword, bool onlyUsers = false, bool onlyPosts = false)
        {
            Keyword = keyword;
            OnlyUsers = onlyUsers;
            OnlyPosts = onlyPosts;
        }
        public bool? OnlyUsers { get; set; } // Lọc chỉ User
        public bool? OnlyPosts { get; set; } // Lọc chỉ Post
        public DateTime? FromDate { get; set; } // Lọc theo ngày bắt đầu
        public DateTime? ToDate { get; set; } // Lọc theo ngày kết thúc
        public int? Year { get; set; }  // 🆕 Lọc theo năm
        public int? Month { get; set; } // 🆕 Lọc theo tháng
        public int? Day { get; set; }   // 🆕 Lọc theo ngày
    }
}
*/