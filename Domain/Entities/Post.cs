using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using static Domain.Common.Enums;
using static Domain.Common.Helper;

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
        public DateTime CreatedAt { get; private set; }
        public DateTime? UpdateAt { get; private set; }
        public bool IsDeleted { get; private set; } // Hỗ trợ xóa mềm
        public double? Score { get; private set; } = 0;
        //for ai
        public bool IsApproved { get; private set; } = false;
        public ApprovalStatusEnum ApprovalStatus { get; private set; } = ApprovalStatusEnum.Pending;
        public ScopeEnum Scope { get; private set; } = ScopeEnum.Public;

        public virtual ICollection<Like> Likes { get; private set; } = new HashSet<Like>();
        public virtual ICollection<Comment> Comments { get; private set; } = new HashSet<Comment>();
        public virtual ICollection<Share> Shares { get; private set; } = new List<Share>();
        public virtual ICollection<Report> Reports { get; private set; } = new HashSet<Report>();
        //CHUPS

        public virtual User? User { get; private set; }

      

        public bool IsSharedPost { get;private set; } = false;
        public Guid? OriginalPostId { get;private set; }
        public Post OriginalPost { get;private set; } = null!;

        public void SoftDelete()
        {
            IsDeleted = true;
        }
        public Post(Guid userId, string content, PostTypeEnum postType, ScopeEnum scope, string? imageUrl = null, string? videoUrl = null)
        {
            Id = Guid.NewGuid();
            UserId = userId;
            Content = content;
            PostType = postType;
            CreatedAt =DateTime.UtcNow;
            Scope = scope;
            ImageUrl = imageUrl;
            VideoUrl = videoUrl;
        }


        public void UpdatePost(string? newContent, string? newImageUrl, string? newVideoUrl, ScopeEnum? newScope)
        {
            bool isUpdated = false;

            // Cập nhật nội dung nếu có thay đổi
            if (!string.IsNullOrWhiteSpace(newContent) && newContent != Content)
            {
                Content = newContent;
                isUpdated = true;
            }

            // Cập nhật hình ảnh nếu có thay đổi (bao gồm trường hợp gán null khi truyền vào ảnh trống)
            if (newImageUrl != null && newImageUrl != ImageUrl)
            {
                ImageUrl = newImageUrl; // Cập nhật hình ảnh nếu có thay đổi
                isUpdated = true;
            }
            else if (newImageUrl == null && ImageUrl != null)  // Nếu ảnh mới là null và ảnh cũ không phải null
            {
                ImageUrl = null; // Gán null nếu truyền ảnh trống
                isUpdated = true;
            }

            // Cập nhật video nếu có thay đổi
            if (newVideoUrl != null && newVideoUrl != VideoUrl)
            {
                VideoUrl = newVideoUrl; // Cập nhật video nếu có thay đổi
                isUpdated = true;
            }
            else if (newVideoUrl == null && VideoUrl != null)  // Nếu video mới là null và video cũ không phải null
            {
                VideoUrl = null; // Gán null nếu truyền video trống
                isUpdated = true;
            }

            // Cập nhật Scope nếu có thay đổi
            if (newScope.HasValue && newScope.Value != Scope)
            {
                Scope = newScope.Value;
                isUpdated = true;
            }

            // Cập nhật thời gian nếu có thay đổi
            if (isUpdated)
            {
                UpdateAt = DateTime.UtcNow; // Cập nhật thời gian chỉ khi có thay đổi
            }
        }
        public void Approve()
        {
            IsApproved = true;
            UpdateAt = DateTime.UtcNow;
        }
        public void IsNotShare()
        {
            IsSharedPost = false;
        }
        public void IsShare()
        {
            IsSharedPost = true;
        }

        public void Reject()
        {
            IsApproved = false;
        }
        public void ApproveAI()
        {
            IsApproved = true;
            ApprovalStatus = ApprovalStatusEnum.Approved;
        }

        public void RejectAI()
        {
            IsApproved = false;
            ApprovalStatus = ApprovalStatusEnum.Rejected;
            UpdateAt = DateTime.UtcNow;
        }
        public void Delete()
        {
            IsDeleted = true;
        }

        public void IncreaseScore(double amount)
        {
            if (amount <= 0)
                throw new ArgumentException("Điểm tăng phải lớn hơn 0.");
            Score += amount;
        }
        //CHUPS
        // Tạo bài Share
        public static Post CreateShare(Guid userId, Post originalPost, string content = "")
        {
            if (originalPost == null) throw new ArgumentNullException(nameof(originalPost));

            return new Post(userId, content, originalPost.PostType, ScopeEnum.Public) // Scope mặc định là Public
            {
                OriginalPostId = originalPost.Id
            };
        }
    }
}




