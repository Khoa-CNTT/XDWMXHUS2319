using Domain.Entities;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.RegularExpressions;
using System.Threading.Tasks;

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
            modelBuilder.Entity<Message>().HasKey(m => m.Id);
            modelBuilder.Entity<Report>().HasKey(r => r.Id);
            modelBuilder.Entity<StudyMaterial>().HasKey(sm => sm.Id);
            modelBuilder.Entity<EmailVerificationToken>().HasKey(e => e.Id);
            modelBuilder.Entity<RefreshToken>().HasKey(r => r.Id);


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

            modelBuilder.Entity<Message>()
                .HasOne<User>()
                .WithMany(u => u.MessageSenders)
                .HasForeignKey(m => m.SenderId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Message>()
                .HasOne<User>()
                .WithMany(u => u.MessageReceivers)
                .HasForeignKey(m => m.ReceiverId)
                .OnDelete(DeleteBehavior.Restrict);

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
                .HasForeignKey(cl => cl.CommentId)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }
}
