using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using static Domain.Common.Enums;

namespace Application.DTOs.Post
{
    public class GetPostForTrainingDto
    {
        public required Guid Id { get;  set; }
        public required Guid UserId { get;  set; }
        public required string Content { get;  set; }
        public DateTime CreatedAt { get;  set; }
        public bool IsApproved { get;  set; } = false;
        public ApprovalStatusEnum ApprovalStatus { get;  set; } = ApprovalStatusEnum.Pending;

    }
}
