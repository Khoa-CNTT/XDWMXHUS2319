using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.DTOs.Reposts
{
    public class ReportDto
    {
        public Guid Id { get; set; }
        public Guid UserId { get; set; } // Thêm: UserId của người báo cáo
        public string? Username { get; set; } // Thêm: Username của người báo cáo
        public string? ProfilePicture { get; set; } // Thêm: Hình ảnh đại diện của người báo cáo
        public string? Reason { get; set; }
        public string? ViolationDetails { get; set; }
        public string? Status { get; set; }
        public bool ProcessedByAI { get; set; }
        public bool ProcessedByAdmin { get; set; }
        public string? ViolationType { get; set; }
        public string? ActionTaken { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
    }
}
