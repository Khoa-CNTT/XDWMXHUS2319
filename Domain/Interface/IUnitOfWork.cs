using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Domain.Interface
{
    public interface IUnitOfWork
    {
        IUserRepository UserRepository { get; }
        IEmailTokenRepository EmailTokenRepository { get; }
        IPostRepository PostRepository { get; }
        ILikeRepository LikeRepository { get; }
        IRefreshtokenRepository RefreshtokenRepository { get; }

        IShareRepository ShareRepository { get; }
        ICommentRepository CommentRepository { get; }
        ICommentLikeRepository CommentLikeRepository { get; }

        IRidePostRepository RidePostRepository { get; }
        IRideRepository RideRepository { get; }
        ILocationUpdateRepository LocationUpdateRepository { get; }

        IReportRepository ReportRepository { get; }
        IRideReportRepository RideReportRepository { get; }
        IRatingRepository RatingRepository { get; }

        Task<int> SaveChangesAsync();
        Task BeginTransactionAsync(); // ✅ Bắt đầu giao dịch
        Task CommitTransactionAsync(); // ✅ Hoàn tất giao dịch
        Task RollbackTransactionAsync();
    }
}
