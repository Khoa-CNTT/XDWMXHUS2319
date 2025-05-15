using System.Text.Json.Nodes;
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

            public DateTime? UpdatedAt { get; private set; }


            public string? Gender { get; private set; }
            public string Status { get; private set; } = "Active"; // Active, Blocked, Suspended
            public DateTime? BlockedUntil { get; private set; }
            public DateTime? SuspendedUntil { get; private set; }
            public DateTime? LastLoginDate { get; private set; }
            public int TotalReports { get; private set; } = 0;


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
            // Navigation property cho AIConversation
            public ICollection<AIConversation> AIConversations { get; set; } = new List<AIConversation>();

            public ICollection<UserScoreHistory> UserScoreHistories { get; private set; } = new List<UserScoreHistory>();

            public ICollection<UserReport> UserReports { get; set; } = new List<UserReport>(); // Những report mà user đã báo cáo
            public ICollection<UserReport> UserReportsCreated { get; set; } = new List<UserReport>(); // Những report mà user đã tạo
            public ICollection<UserAction> UserActions { get; set; } = new List<UserAction>(); // Những hành động của admin đối với user
            public ICollection<RideReport> RideReports { get; set; } = new List<RideReport>();// Những report liên quan đến chuyến đi mà user là đối tượng bị báo cáo


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
                UpdatedAt = DateTime.UtcNow;
            }

            /// <summary>
            /// Cập nhật điểm tin cậy của người dùng.
            /// </summary>
            /// <param name="score">Điểm tin cậy mới.</param>
            public void UpdateTrustScore(decimal score)
            {
                 TrustScore = Math.Max(score, 0);
            }

        /// <summary>
        /// Cập nhật thông tin cá nhân (Họ tên, ảnh đại diện, tiểu sử).
        /// </summary>
        public void UpdateProfile(string? fullName, string? profilePicture, string? backgroundPicture, string? bio)
        {
            if (!string.IsNullOrWhiteSpace(fullName) && FullName != fullName)
                FullName = fullName;

            if (!string.IsNullOrWhiteSpace(profilePicture) && ProfilePicture != profilePicture)
                ProfilePicture = profilePicture;

            if (!string.IsNullOrWhiteSpace(backgroundPicture) && BackgroundPicture != backgroundPicture)
                BackgroundPicture = backgroundPicture;

            if (bio != null && Bio != bio)
                Bio = bio;
        }


        public void UpdateInformation(string? phone, string? relativePhone, string? gender)
        {
            if (!string.IsNullOrWhiteSpace(phone) && Phone != phone)
                Phone = phone;

            if (!string.IsNullOrWhiteSpace(relativePhone) && RelativePhone != relativePhone)
                RelativePhone = relativePhone;

            if (!string.IsNullOrWhiteSpace(gender) && Gender != gender)
                Gender = gender;
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
        public void BlockUntil(DateTime until)
        {
            Status = "Blocked";
            BlockedUntil = until;
        }

        public void SuspendUntil(DateTime until)
        {
            Status = "Suspended";
            SuspendedUntil = until;
        }

        public void MarkAsActive()
        {
            Status = "Active";
            BlockedUntil = null;
            SuspendedUntil = null;
        }

        public void UpdateLastLoginDate()
        {
            LastLoginDate = DateTime.UtcNow;
        }

        public void IncreaseReportCount()
        {
            TotalReports++;
        }
    }
}



