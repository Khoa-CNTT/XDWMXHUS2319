using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.DTOs.Post
{
    public class PostAdminDto
    {
        public Guid Id { get; set; }
        public string? Content { get; set; }
        public string Author { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
        public ApprovalStatusEnum ApprovalStatus { get; set; }
        public ScopeEnum Scope { get; set; }
        public PostTypeEnum PostType { get; set; }
        public bool IsDeleted { get; set; }
        public bool IsSharedPost { get; set; }
        public double? Score { get;  set; }
        public int ReportCount { get; set; }
    }
}
