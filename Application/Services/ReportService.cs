using Application.DTOs.Reposts;
using Application.Interface;
using Application.Interface.Api;
using Application.Interface.ContextSerivce;
using Domain.Common;
using Domain.Entities;
using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using static Domain.Common.Enums;

namespace Application.Services
{
    public class ReportService : IReportService
    {
        private readonly IReportRepository _reportRepository;
        
        private readonly IUnitOfWork _unitOfWork;
        private readonly IGeminiService _geminiService;
        private readonly IUserContextService _userContextService;
        public ReportService(
            IReportRepository reportRepository,
            IUnitOfWork unitOfWork,
            IGeminiService geminiService,
            IUserContextService userContextService)
        {
            _reportRepository = reportRepository;
            _unitOfWork = unitOfWork;
            _geminiService = geminiService;
            _userContextService = userContextService;
        }
        public async Task<Guid> CreateReportAsync(Guid postId, string reason)
        {
            var userId = _userContextService.UserId();
            var post = await _unitOfWork.PostRepository.GetByIdAsync(postId);
            if (post == null) throw new Exception("Post not found");

            // Khởi tạo báo cáo trước khi kiểm tra AI
            var report = new Report(userId, postId, reason, post.ApprovalStatus);

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
                return ResponseFactory.Fail<bool>("Không được để trống", 204);
            }
            var reports = await _unitOfWork.ReportRepository.GetReportsByPostIdDeleteAsync(postId);

            if (reports == null || !reports.Any())
            {
                return ResponseFactory.Fail<bool>("Không có report để xóa", 204);
            }

            foreach (var report in reports)
            {
               await _unitOfWork.ReportRepository.DeleteAsync(report.Id);
            }

            await _unitOfWork.SaveChangesAsync();
            return ResponseFactory.Success(true, "Xóa tất cả báo cáo thành công", 204);
        }
        public async Task<ResponseModel<bool>> SoftDeletePostAsync(Guid postId)
        {
            var post = await _unitOfWork.PostRepository.GetByIdAsync(postId);
            // 🔥 Kiểm tra xem bài viết có tồn tại không
            if (post == null)
            {
                return ResponseFactory.Fail<bool>("Không tìm thấy bài viết này", 404);
            }
            // 🔥 Kiểm tra xem bài viết có bị xóa chưa
            if (post.IsDeleted)
            {
                return ResponseFactory.Fail<bool>("Bài viết này đã bị xóa", 404);
            }
            var user = await _unitOfWork.UserRepository.GetByIdAsync(post.UserId);
            if (user == null)
            {
                return ResponseFactory.Fail<bool>("Không tồn tại người dùng", 404);
            }
                // 🔥 Bắt đầu giao dịch
                await _unitOfWork.BeginTransactionAsync();
            try
            {
                // 🔥 Xóa bài viết
                post.Delete();
                user.UpdateTrustScore(user.TrustScore - 20);
                // 🔥 Lưu thay đổi
                await _unitOfWork.SaveChangesAsync();
                await _unitOfWork.CommitTransactionAsync();
                return ResponseFactory.Success(true, "Xóa bài viết thành công", 200);
            }
            catch (Exception ex)
            {
                await _unitOfWork.RollbackTransactionAsync();
                return ResponseFactory.Error<bool>("Lỗi Error", 500, ex);
            }
        }
    }
}
