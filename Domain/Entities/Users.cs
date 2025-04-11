using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using static Domain.Common.Enums;


namespace Domain.Entities
    {
        public class User
        {
            public Guid Id { get; private set; }
            public string FullName { get; private set; }
            public string Email { get; private set; }
            public string PasswordHash { get; private set; }
            public string? ProfilePicture { get; private set; }
            public string? BackgroundPicture { get; private set; }
            public string? Bio { get; private set; }
            public DateTime CreatedAt { get; private set; } = DateTime.UtcNow;
            public bool IsVerifiedEmail { get; private set; } = false;
            public decimal TrustScore { get; private set; } = 0;
            public RoleEnum Role { get; private set; } = RoleEnum.User;
            public string? RelativePhone { get; private set; }
            public string? Phone { get; private set; }
            public DateTime? LastActive { get; private set; }
           
            public virtual ICollection<Post> Posts { get; private set; } = new HashSet<Post>();
            public virtual ICollection<Like> Likes { get; private set; } = new HashSet<Like>();
            public virtual ICollection<Comment> Comments { get; private set; } = new HashSet<Comment>();
            public virtual ICollection<Friendship> SentFriendRequests { get; private set; } = new HashSet<Friendship>();
            public virtual ICollection<Friendship> ReceivedFriendRequests { get; private set; } = new HashSet<Friendship>();
           
            public virtual ICollection<Report> Reports { get; private set; } = new HashSet<Report>();
            public virtual ICollection<GroupMember> GroupMembers { get; private set; } = new HashSet<GroupMember>();

            public virtual ICollection<CommentLike> CommentLikes { get; private set; } = new List<CommentLike>();

            //CHUPS
            public virtual ICollection<Share> Shares { get; private set; } = new HashSet<Share>();
            //huy
            public ICollection<RidePost> RidePosts { get;private set; } = new List<RidePost>();
            public ICollection<Ride> DrivenRides { get; private set; } = new List<Ride>(); // Những chuyến đi do user làm tài xế
            public ICollection<Ride> RidesAsPassenger { get; private set; } = new List<Ride>(); // Những chuyến đi user là hành khách
            public ICollection<LocationUpdate> LocationUpdates { get; private set; } = new List<LocationUpdate>();
            //tin nhắn
            // Navigation properties cho Conversation
            public ICollection<Conversation> ConversationsAsUser1 { get; private set; } = new List<Conversation>();
            public ICollection<Conversation> ConversationsAsUser2 { get; private set; } = new List<Conversation>();

            // Navigation property cho Message
            public ICollection<Message> SentMessages { get; set; } = new List<Message>();
            public ICollection<Notification> ReceivedNotifications { get; set; } = new List<Notification>();
            public ICollection<Notification> SentNotifications { get; set; } = new List<Notification>();

        public User(string fullName, string email, string passwordHash)
            {
                if (string.IsNullOrWhiteSpace(fullName)) throw new ArgumentException("Full name is required.");
                if (string.IsNullOrWhiteSpace(email)) throw new ArgumentException("Email is required.");
                if (string.IsNullOrWhiteSpace(passwordHash)) throw new ArgumentException("Password is required.");

                Id = Guid.NewGuid();
                FullName = fullName;
                Email = email;
                PasswordHash = passwordHash;
                CreatedAt = DateTime.UtcNow;
            }

            /// <summary>
            /// Xác minh email của người dùng.
            /// </summary>
            public void VerifyEmail()
            {
                IsVerifiedEmail = true;
            }

            /// <summary>
            /// Cập nhật điểm tin cậy của người dùng.
            /// </summary>
            /// <param name="score">Điểm tin cậy mới.</param>
            public void UpdateTrustScore(decimal score)
            {
                if (score < 0) throw new ArgumentException("Trust score cannot be negative.");
                TrustScore = score;
            }

            /// <summary>
            /// Cập nhật thông tin cá nhân (Họ tên, ảnh đại diện, tiểu sử).
            /// </summary>
            public void UpdateProfile(string fullName, string? profilePicture,string? backgroundPicture, string? bio, string? phone, string? relativePhone)
            {
                if (string.IsNullOrWhiteSpace(fullName))
                    throw new ArgumentException("Full name cannot be empty.");

                FullName = fullName;
                ProfilePicture = profilePicture;
                BackgroundPicture = backgroundPicture;
                Bio = bio;
                Phone = phone;
                RelativePhone = relativePhone;
            }

            /// <summary>
            /// Cập nhật mật khẩu mới (đã hash).
            /// </summary>
            public void UpdatePassword(string newPasswordHash)
            {
                if (string.IsNullOrWhiteSpace(newPasswordHash))
                    throw new ArgumentException("New password cannot be empty.");

                PasswordHash = newPasswordHash;
            }

           
        }
    }



