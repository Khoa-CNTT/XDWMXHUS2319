

namespace Infrastructure
{

    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        public DbSet<User> Users { get; set; }
        public DbSet<Post> Posts { get; set; } 
        public DbSet<Like> Likes { get; set; }
        public DbSet<Comment> Comments { get; set; }
        public DbSet<CommentLike> CommentLikes { get; set; }
        public DbSet<Share> Shares { get; set; }
        public DbSet<Friendship> Friendships { get; set; }
        public DbSet<Domain.Entities.Group> Groups { get; set; }
        public DbSet<GroupMember> GroupMembers { get; set; }
        public DbSet<Message> Messages { get; set; }
        public DbSet<Report> Reports { get; set; }
        public DbSet<StudyMaterial> StudyMaterials { get; set; }
        public DbSet<EmailVerificationToken> emailVerificationTokens { get; set; }
        public DbSet<RefreshToken> RefreshTokens { get; set; }
        public DbSet<Conversation> Conversations { get; set; } // Thêm DbSet cho Conversation
        public DbSet<Notification> Notifications { get; set; } // Thêm DbSet cho Notification

        //huy
        public DbSet<RidePost> RidePosts { get; set; }
        public DbSet<Ride> Rides { get; set; }
        public DbSet<LocationUpdate> LocationUpdates { get; set; }
        public DbSet<RideReport> RideReports { get; set; }
        public DbSet<Rating> Ratings { get; set; }


        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            // Khóa chính
            modelBuilder.Entity<User>().HasKey(u => u.Id);
            modelBuilder.Entity<Post>().HasKey(p => p.Id);
            modelBuilder.Entity<Like>().HasKey(l => l.Id);
            modelBuilder.Entity<Comment>().HasKey(c => c.Id);
            modelBuilder.Entity<Share>().HasKey(s => s.Id);
            modelBuilder.Entity<Friendship>().HasKey(f => f.Id);
            modelBuilder.Entity<Domain.Entities.Group>().HasKey(g => g.Id);
            modelBuilder.Entity<GroupMember>().HasKey(gm => gm.Id);
            modelBuilder.Entity<Report>().HasKey(r => r.Id);
            modelBuilder.Entity<StudyMaterial>().HasKey(sm => sm.Id);
            modelBuilder.Entity<EmailVerificationToken>().HasKey(e => e.Id);
            modelBuilder.Entity<RefreshToken>().HasKey(r => r.Id);
            //huy
            modelBuilder.Entity<RidePost>().HasKey(rp => rp.Id);
            modelBuilder.Entity<Ride>().HasKey(r => r.Id);
            modelBuilder.Entity<LocationUpdate>().HasKey(lu => lu.Id);
            modelBuilder.Entity<RideReport>().HasKey(rr => rr.Id);
            modelBuilder.Entity<Rating>().HasKey(r => r.Id);
            modelBuilder.Entity<Conversation>().HasKey(c => c.Id);
            modelBuilder.Entity<Message>().HasKey(c => c.Id);
            modelBuilder.Entity<Notification>().HasKey(n => n.Id);


            //Dùng HasQueryFilter để tự động loại bỏ dữ liệu đã bị xóa mềm (IsDeleted = true) khi truy vấn.
            //Nếu không sử dụng, cần phải thêm điều kiện IsDeleted = false trong mỗi truy vấn.
            modelBuilder.Entity<Post>().HasQueryFilter(p => !p.IsDeleted);
            modelBuilder.Entity<Comment>().HasQueryFilter(c => !c.IsDeleted);
            modelBuilder.Entity<Like>().HasQueryFilter(l => !l.IsDeleted);
            modelBuilder.Entity<Share>().HasQueryFilter(s => !s.IsDeleted);
            // Cấu hình quan hệ
            modelBuilder.Entity<Post>()
                .HasOne(p => p.User)
                .WithMany(u => u.Posts)
                .HasForeignKey(p => p.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<Like>()
                .HasOne(l => l.User)
                .WithMany(u => u.Likes)
                .HasForeignKey(l => l.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<Like>()
                .HasOne(l => l.Post)
                .WithMany(p => p.Likes)
                .HasForeignKey(l => l.PostId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<Comment>()
                .HasOne(c => c.User)
                .WithMany(u => u.Comments)
                .HasForeignKey(c => c.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<Comment>()
                .HasOne(c => c.Post)
                .WithMany(p => p.Comments)
                .HasForeignKey(c => c.PostId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<Friendship>()
                .HasOne<User>()
                .WithMany(u => u.SentFriendRequests)
                .HasForeignKey(f => f.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<Friendship>()
                .HasOne<User>()
                .WithMany(u => u.ReceivedFriendRequests)
                .HasForeignKey(f => f.FriendId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<Report>()
                .HasOne<User>()
                .WithMany(u => u.Reports)
                .HasForeignKey(r => r.ReportedBy)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<Report>()
                .HasOne<Post>()
                .WithMany(p => p.Reports)
                .HasForeignKey(r => r.PostId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<GroupMember>()
                .HasOne<Domain.Entities.Group>()
                .WithMany(g => g.GroupMembers)
                .HasForeignKey(gm => gm.GroupId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<GroupMember>()
                .HasOne<User>()
                .WithMany(u => u.GroupMembers)
                .HasForeignKey(gm => gm.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<EmailVerificationToken>()
                .HasOne<User>()
                .WithMany()
                .HasForeignKey(e => e.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<RefreshToken>()
                .HasOne<User>()
                .WithMany()
                .HasForeignKey(r => r.UserId)
                .OnDelete(DeleteBehavior.Cascade);
            //CHUPS
            modelBuilder.Entity<User>()
                .HasMany(u => u.Posts)  // Một User có nhiều Posts
                .WithOne(p => p.User)   // Một Post chỉ thuộc về một User
                .HasForeignKey(p => p.UserId)
                .OnDelete(DeleteBehavior.Cascade); // Khi User bị xóa, xóa luôn Posts của họ
                                                   // Cấu hình quan hệ Post - Likes
            modelBuilder.Entity<Post>()
                .HasMany(p => p.Likes)
                .WithOne(l => l.Post)
                .HasForeignKey(l => l.PostId)
                .OnDelete(DeleteBehavior.Cascade);

            // Cấu hình quan hệ Post - Comments
            modelBuilder.Entity<Post>()
                .HasMany(p => p.Comments)
                .WithOne(c => c.Post)
                .HasForeignKey(c => c.PostId)
                .OnDelete(DeleteBehavior.Cascade);

            // Cấu hình quan hệ Post - Shares
            modelBuilder.Entity<Post>()
                .HasMany(p => p.Shares)
                .WithOne(s => s.Post)
                .HasForeignKey(s => s.PostId)
                .OnDelete(DeleteBehavior.Cascade);
            // Quan hệ 1 User - N Share
            modelBuilder.Entity<Share>()
                .HasOne(s => s.User)
                .WithMany(u => u.Shares)
                .HasForeignKey(s => s.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            // Quan hệ 1 Post - N Share
            modelBuilder.Entity<Share>()
                .HasOne(s => s.Post)
                .WithMany(p => p.Shares)
                .HasForeignKey(s => s.PostId)
                .OnDelete(DeleteBehavior.Cascade);

            // 🔥 Thiết lập quan hệ comment cha - comment con
            modelBuilder.Entity<Comment>()
                .HasOne(c => c.ParentComment)
                .WithMany(c => c.Replies)
                .HasForeignKey(c => c.ParentCommentId)
                .OnDelete(DeleteBehavior.Restrict); // Tránh lỗi vòng lặp
                                                    // 🔥 Thiết lập quan hệ like comment
            modelBuilder.Entity<CommentLike>()
                .HasKey(cl => new { cl.UserId, cl.CommentId }); // Đảm bảo 1 user chỉ like 1 lần

            modelBuilder.Entity<CommentLike>()
                .HasOne(cl => cl.User)
                .WithMany(u => u.CommentLikes)
                .HasForeignKey(cl => cl.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<CommentLike>()
                .HasOne(cl => cl.Comment)
                .WithMany(c => c.CommentLikes)
                .HasForeignKey(cl => cl.CommentId);

            //huy
            // 1. Quan hệ 1 User - N RidePost
            modelBuilder.Entity<RidePost>()
                .HasOne(rp => rp.User)
                .WithMany(u => u.RidePosts)
                .HasForeignKey(rp => rp.UserId)
                .OnDelete(DeleteBehavior.Cascade); // Khi User bị xóa, RidePost cũng bị xóa

            // 2. Quan hệ 1 RidePost - 1 Ride (1 bài đăng chỉ có thể tạo ra 1 chuyến đi)
            modelBuilder.Entity<Ride>()
                .HasOne(r => r.RidePost)
                .WithOne(rp => rp.Ride)
                .HasForeignKey<Ride>(r => r.RidePostId)
                .OnDelete(DeleteBehavior.Cascade); // Nếu RidePost bị xóa, Ride cũng bị xóa

            // 3. Quan hệ 1 User - N Rides (tài xế có thể có nhiều chuyến đi)
            modelBuilder.Entity<Ride>()
                .HasOne(r => r.Driver)
                .WithMany(u => u.DrivenRides)
                .HasForeignKey(r => r.DriverId)
                .OnDelete(DeleteBehavior.Restrict); // Không cho phép xóa tài xế nếu còn chuyến đi

            // 4. Quan hệ 1 User - N Rides (hành khách có thể có nhiều chuyến đi)
            modelBuilder.Entity<Ride>()
                .HasOne(r => r.Passenger)
                .WithMany(u => u.RidesAsPassenger)
                .HasForeignKey(r => r.PassengerId)
                .OnDelete(DeleteBehavior.Restrict);

            // 5. Quan hệ 1 User - N LocationUpdates (mỗi user có thể cập nhật nhiều vị trí)
            modelBuilder.Entity<LocationUpdate>()
                .HasOne(l => l.User)
                .WithMany(u => u.LocationUpdates)
                .HasForeignKey(l => l.RideId)

                .OnDelete(DeleteBehavior.Cascade);
            // 6. Quan hệ 1 Ride - N LocationUpdates (mỗi chuyến đi có thể có nhiều cập nhật vị trí)
            modelBuilder.Entity<LocationUpdate>()
                .HasOne(l => l.Ride)
                .WithMany(r => r.LocationUpdates)
                .HasForeignKey(l => l.RideId)
                .OnDelete(DeleteBehavior.Cascade);
            //message
            // Cấu hình Conversation
            modelBuilder.Entity<Conversation>()
                .HasKey(c => c.Id);

            modelBuilder.Entity<Conversation>()
                .Property(c => c.CreatedAt)
                .HasDefaultValueSql("GETDATE()");

            modelBuilder.Entity<Conversation>()
                .HasIndex(c => new { c.User1Id, c.User2Id })
                .IsUnique();

            modelBuilder.Entity<Conversation>()
                .HasOne(c => c.User1)
                .WithMany(u => u.ConversationsAsUser1)
                .HasForeignKey(c => c.User1Id) // Rõ ràng ánh xạ User1Id
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Conversation>()
                .HasOne(c => c.User2)
                .WithMany(u => u.ConversationsAsUser2)
                .HasForeignKey(c => c.User2Id) // Rõ ràng ánh xạ User2Id
                .OnDelete(DeleteBehavior.Restrict);

            // Cấu hình Message
            modelBuilder.Entity<Message>()
                .HasKey(m => m.Id);

            modelBuilder.Entity<Message>()
                .Property(m => m.SentAt)
                .HasColumnType("datetime2")
                .HasDefaultValueSql("GETDATE()");

            modelBuilder.Entity<Message>()
                .Property(m => m.IsSeen)
                .HasDefaultValue(false);

            modelBuilder.Entity<Message>()
                .Property(m => m.SeenAt)
                .HasColumnType("datetime2");

            modelBuilder.Entity<Message>()
                .HasOne(m => m.Conversation)
                .WithMany(c => c.Messages)
                .HasForeignKey(m => m.ConversationId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<Message>()
                .HasOne(m => m.Sender)
                .WithMany(u => u.SentMessages)
                .HasForeignKey(m => m.SenderId) // Rõ ràng ánh xạ SenderId
                .OnDelete(DeleteBehavior.Restrict);
            modelBuilder.Entity<Message>()
                .Property(m => m.SenderId)
                .HasColumnName("SenderId"); // Rõ ràng tên cột trong DB
            //notification
            modelBuilder.Entity<Notification>()
                .HasKey(n => n.Id);

            modelBuilder.Entity<Notification>()
                .HasOne(n => n.Receiver)
                .WithMany(u => u.ReceivedNotifications)
                .HasForeignKey(n => n.ReceiverId)
                .OnDelete(DeleteBehavior.Restrict);


            modelBuilder.Entity<Notification>()
                .HasOne(n => n.Sender)
                .WithMany(u => u.SentNotifications)
                .HasForeignKey(n => n.SenderId)
                .OnDelete(DeleteBehavior.Restrict);




        }
    }
}
