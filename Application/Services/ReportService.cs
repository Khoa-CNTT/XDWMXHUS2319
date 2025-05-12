using Application.DTOs.Reposts;
using Application.DTOs.User;
using Application.Interface.Hubs;
using Domain.Interface;
using MediatR;
namespace Application.Services
{
    public class ReportService : IReportService
    {
        private readonly IReportRepository _reportRepository;
        private readonly IPublisher _publisher;
        private readonly IUnitOfWork _unitOfWork;
        private readonly IGeminiService _geminiService;
        private readonly IUserContextService _userContextService;
        public ReportService(
            IReportRepository reportRepository,
            IUnitOfWork unitOfWork,
            IGeminiService geminiService,
            IPublisher publisher,
            IUserContextService userContextService)
        {
            _reportRepository = reportRepository;
            _unitOfWork = unitOfWork;
            _geminiService = geminiService;
            _publisher = publisher;
            _userContextService = userContextService;
        }
        public async Task<Guid> CreateReportAsync(Guid postId, string reason)
        {
            var userId = _userContextService.UserId();
            var post = await _unitOfWork.PostRepository.GetByIdAsync(postId);
            if (post == null) throw new Exception("Post not found");

            var user = await _unitOfWork.UserRepository.GetByIdAsync(userId);
            if (user == null) throw new Exception("User not found");
            if (user.Status == "Suspended") throw new Exception("Tài khoản đang bị tạm ngưng");

            // Khởi tạo báo cáo trước khi kiểm tra AI
            var report = new Report(userId, postId, reason, post.ApprovalStatus);
            var admins = await _unitOfWork.UserRepository.GetAdminsAsync();

            foreach (var admin in admins)
            {
                // Thông báo cho admin về báo cáo mới
                var message = $"Có báo cáo mới ";

                // Tạo dữ liệu thông báo
                var notificationData = new ResponseNotificationModel
                {
                    Message = message,
                    Url = $"/admin/userreport",
                    CreatedAt = DateTime.UtcNow.ToString(),
                    SenderId = userId
                };

                // Gửi sự kiện AdminNotificationEvent qua SignalR
                await _publisher.Publish(new AdminNotificationEvent(admin.Id, notificationData));

                // Lưu thông báo vào database
                var notification = new Notification(
                    admin.Id,
                    userId,
                    message,
                    NotificationType.ReportPost,
                    null,
                    notificationData.Url
                );

                await _unitOfWork.NotificationRepository.AddAsync(notification);
            }
            // Gửi nội dung bài viết cho AI kiểm duyệt
            var isViolated = await _geminiService.ValidatePostContentAsync(post.Content);

            if (isViolated)
            {
                // Nếu không vi phạm,post vẫn bình thường và để admin xử lý
                post.UpdateApprovalStatus(ApprovalStatusEnum.Approved, true);
            }
            else
            {
                report.ProcessByAI(true, "AI phát hiện nội dung vi phạm.", ViolationTypeEnum.Other);
                post.UpdateApprovalStatus(ApprovalStatusEnum.Rejected, false);

            }

            await _unitOfWork.ReportRepository.AddAsync(report);
            await _unitOfWork.PostRepository.UpdateAsync(post);
            await _unitOfWork.SaveChangesAsync();
            return report.Id;
        }

        public async Task<List<PostWithReportsDto>> GetAllPostsWithReportsAsync()
        {
            var posts = await _unitOfWork.PostRepository.GetAllPostsWithReportsAsync();
            var reports = await _unitOfWork.ReportRepository.GetAllAsync();
            // ✅ Lọc ra những report chưa được AI xử lý
            var filtered = reports.Where(x => x.Status != ReportStatusEnum.AI_Processed);
            var result = posts.Select(Mapping.MapToPostWithReportsDto).ToList();

            return result;
        }

        public async Task<IEnumerable<ReportResponseDto>> GetAllReportsAsync()
        {
            var reports = await _reportRepository.GetAllAsync();

            // ✅ Lọc ra những report chưa được AI xử lý
            var filtered = reports.Where(x => x.Status != ReportStatusEnum.AI_Processed);

            return filtered.Select(Mapping.ToResponseRepostDto);
        }

        public async Task<ReportDetailsDto?> GetReportDetailsAsync(Guid reportId)
        {
            var report = await _reportRepository.GetReportDetailsAsync(reportId);
            return report is null ? null : Mapping.ToRepostDetailsDto(report);
        }

        public  async Task<IEnumerable<ReportResponseDto>> GetReportsByPostAsync(Guid postId)
        {
            var reports = await _reportRepository.GetByPostIdAsync(postId);
            return reports.Select(Mapping.ToResponseRepostDto);
        }

        

        public async Task ProcessReportByAdminAsync(ProcessReportDto dto)
        {
            var report = await _reportRepository.GetByIdAsync(dto.ReportId);
            if (report == null)
                throw new Exception("Report not found");
            //neu da xu  boi AI thi ko cho xư ly
            if (report.Status ==  ReportStatusEnum.AI_Processed)
                throw new Exception("Report already processed by AI");

            report.ProcessByAdmin(dto.IsViolated, dto.Details ?? "",dto.ViolationType ,dto.ActionTaken ?? ActionTakenEnum.None);

            // Nếu vi phạm → cập nhật trạng thái bài viết là Rejected
            if (dto.IsViolated)
            {
                var post = await _unitOfWork.PostRepository.GetByIdAsync(report.PostId);
                if (post == null)
                    throw new Exception("Post not found");

                post.UpdateApprovalStatus(ApprovalStatusEnum.Rejected, true);
                report.UpdatePostStatus(ApprovalStatusEnum.Rejected);

                await _unitOfWork.PostRepository.UpdateAsync(post);
            }

            await _reportRepository.UpdateAsync(report);
            await _unitOfWork.SaveChangesAsync();
        }

       

        public async Task ProcessReportByAIAsync(ProcessReportDto dto)
        {
            var report = await _reportRepository.GetByIdAsync(dto.ReportId);
            if (report == null) throw new Exception("Report not found");

            report.ProcessByAI(dto.IsViolated, dto.Details ?? "", dto.ViolationType ?? ViolationTypeEnum.Other);

            if (dto.IsViolated)
            {
                var post = await _unitOfWork.PostRepository.GetByIdAsync(report.PostId);
                post?.UpdateApprovalStatus(ApprovalStatusEnum.Rejected, false);
                report.UpdatePostStatus(ApprovalStatusEnum.Rejected);
                await _unitOfWork.PostRepository.UpdateAsync(post!);
            }

            await _reportRepository.UpdateAsync(report);
            await _unitOfWork.SaveChangesAsync();
        }
        public async Task<ResponseModel<bool>> DeleteAllReportsOfPostAsync(Guid postId)
        {
            if (postId == Guid.Empty)
            {
                return ResponseFactory.Fail<bool>("Không được để trống", 400);
            }

            var reports = await _unitOfWork.ReportRepository.GetReportsByPostIdDeleteAsync(postId);

            if (reports == null || !reports.Any())
            {
                return ResponseFactory.Fail<bool>("Không có báo cáo để xóa", 404);
            }

            foreach (var report in reports)
            {
                report.SoftDelete(); 
            }

            await _unitOfWork.SaveChangesAsync();
            return ResponseFactory.Success(true, "Đã xóa mềm tất cả báo cáo của bài viết", 200);
        }
        public async Task<ResponseModel<bool>> SoftDeletePostAsync(Guid postId)
        {
            var post = await _unitOfWork.PostRepository.GetByIdAsync(postId);
            if (post == null)
            {
                return ResponseFactory.Fail<bool>("Không tìm thấy bài viết này", 404);
            }

            if (post.IsDeleted)
            {
                return ResponseFactory.Fail<bool>("Bài viết này đã bị xóa trước đó", 400);
            }
            var user = await _unitOfWork.UserRepository.GetByIdAsync(post.UserId);
            if (user == null)
            {
                return ResponseFactory.Fail<bool>("Không tồn tại người dùng", 404);
            }

            await _unitOfWork.BeginTransactionAsync();
            try
            {
                // 🔥 Xóa mềm bài viết
                post.Delete();

                // 🔥 Trừ điểm tin cậy của user
                user.UpdateTrustScore(user.TrustScore - 20);

                // 🔥 Xóa mềm các báo cáo liên quan bài viết
                var reports = await _unitOfWork.ReportRepository.GetReportsByPostIdDeleteAsync(postId);
                if (reports != null && reports.Any())
                {
                    foreach (var report in reports)
                    {
                        report.SoftDelete(); // ❗ Dùng SoftDelete
                    }
                }

                await _unitOfWork.SaveChangesAsync();
                await _unitOfWork.CommitTransactionAsync();

                return ResponseFactory.Success(true, "Đã xóa bài viết và các báo cáo liên quan", 200);
            }
            catch (Exception ex)
            {
                await _unitOfWork.RollbackTransactionAsync();
                return ResponseFactory.Error<bool>("Đã xảy ra lỗi trong quá trình xóa", 500, ex);
            }
        }

        public async Task<IEnumerable<UserReportGroupDto>> GetAllUserReportsAsync()
        {
            var userReports = await _unitOfWork.UserReportRepository.GetAllUserReportAsync();

            return Mapping.MapToUserReportDtoList(userReports);
        }

        public async Task<ResponseModel<bool>> DeleteAllUserReportsByUserIdAsync(Guid reportedUserId)
        {
            if (reportedUserId == Guid.Empty)
            {
                return ResponseFactory.Fail<bool>("Không được để trống ID người bị báo cáo", 400);
            }

            var reports = await _unitOfWork.UserReportRepository.GetReportsByUserIdAsync(reportedUserId);

            if (reports == null || !reports.Any())
            {
                return ResponseFactory.Fail<bool>("Không có báo cáo nào để xóa", 404);
            }

            await _unitOfWork.BeginTransactionAsync();
            try
            {
                foreach (var report in reports)
                {
                    report.SoftDelete(); // 🔥 Xóa mềm báo cáo
                    report.UpdateStatus("Deleted"); // 🔥 Cập nhật Status mới

                    // 🔥 Trừ điểm người báo cáo
                    var reportedByUser = await _unitOfWork.UserRepository.GetByIdAsync(report.ReportedByUserId);
                    if (reportedByUser != null)
                    {
                        reportedByUser.UpdateTrustScore(reportedByUser.TrustScore - 5); // Trừ 5 điểm mỗi lần
                        await _unitOfWork.UserRepository.UpdateAsync(reportedByUser);
                    }
                }

                await _unitOfWork.SaveChangesAsync();
                await _unitOfWork.CommitTransactionAsync();

                return ResponseFactory.Success(true, "Đã xóa mềm các báo cáo và cập nhật điểm tin cậy", 200);
            }
            catch (Exception ex)
            {
                await _unitOfWork.RollbackTransactionAsync();
                return ResponseFactory.Error<bool>("Đã xảy ra lỗi khi xóa báo cáo và cập nhật điểm", 500, ex);
            }
        }

        public  async Task<ResponseModel<bool>> AcceptUserReportsByUserIdAsync(Guid reportedUserId)
        {
            if (reportedUserId == Guid.Empty)
            {
                return ResponseFactory.Fail<bool>("Không được để trống ID người bị báo cáo", 400);
            }

            var reports = await _unitOfWork.UserReportRepository.GetReportsByUserIdAsync(reportedUserId);

            if (reports == null || !reports.Any())
            {
                return ResponseFactory.Fail<bool>("Không có báo cáo nào để xử lý", 404);
            }

            await _unitOfWork.BeginTransactionAsync();
            try
            {
                foreach (var report in reports)
                {
                    // 🔥 Cập nhật trạng thái báo cáo
                    report.UpdateStatus("Accepted");

                    // 🔥 Cộng điểm cho người báo cáo
                    var reportedByUser = await _unitOfWork.UserRepository.GetByIdAsync(report.ReportedByUserId);
                    if (reportedByUser != null)
                    {
                        reportedByUser.UpdateTrustScore(reportedByUser.TrustScore + 5); // Cộng 5 điểm
                        await _unitOfWork.UserRepository.UpdateAsync(reportedByUser);
                    }

                    // 🔥 Trừ điểm người bị báo cáo
                    var reportedUser = await _unitOfWork.UserRepository.GetByIdAsync(report.ReportedUserId);
                    if (reportedUser != null)
                    {
                        reportedUser.UpdateTrustScore(reportedUser.TrustScore - 10); // Trừ 10 điểm
                        await _unitOfWork.UserRepository.UpdateAsync(reportedUser);
                    }

                    await _unitOfWork.UserReportRepository.UpdateAsync(report); // 🔥 Lưu cập nhật report
                }

                await _unitOfWork.SaveChangesAsync();
                await _unitOfWork.CommitTransactionAsync();

                return ResponseFactory.Success(true, "Đã chấp nhận các báo cáo và cập nhật điểm tin cậy", 200);
            }
            catch (Exception ex)
            {
                await _unitOfWork.RollbackTransactionAsync();
                return ResponseFactory.Error<bool>("Đã xảy ra lỗi khi chấp nhận báo cáo", 500, ex);
            }
        }
    }
}
