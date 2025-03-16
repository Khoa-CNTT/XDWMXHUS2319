using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using static Domain.Common.Enums;

namespace Domain.Entities
{
    public class Post
    {
        public Guid Id { get; private set; }
        public Guid UserId { get; private set; }
        public string Content { get; private set; }
        public string? ImageUrl { get; private set; }
        public string? VideoUrl { get; private set; }
        public PostTypeEnum PostType { get; private set; }
        public DateTime CreatedAt { get; private set; } = DateTime.UtcNow;
        public DateTime? UpdateAt { get; private set; }
        public double? Score { get; private set; } = 0;
        public bool IsApproved { get; private set; } = false;
        public ApprovalStatusEnum ApprovalStatus { get; private set; } = ApprovalStatusEnum.Pending;
        public ScopeEnum Scope { get; private set; } = ScopeEnum.Public;
        public virtual ICollection<Like> Likes { get; private set; } = new HashSet<Like>();
        public virtual ICollection<Comment> Comments { get; private set; } = new HashSet<Comment>();
        public virtual ICollection<Report> Reports { get; private set; } = new HashSet<Report>();


        public Post(Guid userId, string content, PostTypeEnum postType, ScopeEnum scope, string? imageUrl = null, string? videoUrl = null)
        {
            Id = Guid.NewGuid();
            UserId = userId;
            Content = content;
            PostType = postType;
            Scope = scope;
            ImageUrl = imageUrl;
            VideoUrl = videoUrl;
        }

        public void UpdatePost(string? newContent, string? newImageUrl, string? newVideoUrl, ScopeEnum? newScope)
        {
            if (!string.IsNullOrWhiteSpace(newContent))
                Content = newContent;

            if (newImageUrl != null || newVideoUrl != null)
            {
                ImageUrl = newImageUrl;
                VideoUrl = newVideoUrl;
            }

            if (newScope.HasValue)
                Scope = newScope.Value;

            UpdateAt = DateTime.UtcNow;
        }

        public void Approve()
        {
            IsApproved = true;
            UpdateAt = DateTime.UtcNow;
        }

        public void Reject()
        {
            IsApproved = false;
            UpdateAt = DateTime.UtcNow;
        }
        public void ApproveAI()
        {
            IsApproved = true;
            ApprovalStatus = ApprovalStatusEnum.Approved;
            UpdateAt = DateTime.UtcNow;
        }

        public void RejectAI()
        {
            IsApproved = false;
            ApprovalStatus = ApprovalStatusEnum.Rejected;
            UpdateAt = DateTime.UtcNow;
        }

        public void IncreaseScore(double amount)
        {
            if (amount <= 0)
                throw new ArgumentException("Điểm tăng phải lớn hơn 0.");
            Score += amount;
        }

    }
}




