using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using static Domain.Common.Enums;

namespace Application.DTOs.Posts
{
    public class GetPostDto
    {
        public Guid Id { get;  set; }
        public Guid UserId { get;  set; }
        public string? Content { get;  set; }
        public string? ImageUrl { get;  set; }
        public string? VideoUrl { get;  set; }
        public PostTypeEnum PostType { get;  set; }
        public DateTime CreatedAt { get;  set; }
        public DateTime? UpdateAt { get; set; }

        public double Score { get; set; }
        public bool IsApproved { get;  set; }
        public ApprovalStatusEnum ApprovalStatus { get;  set; }
        public ScopeEnum Scope { get;  set; }
    }
}
