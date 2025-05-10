namespace Application.CQRS.Commands.Users
{
    public class CreateUserReportUserCommandHandler : IRequestHandler<CreateUserReportUserCommand, ResponseModel<bool>>
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IUserContextService _userContextService;
        public CreateUserReportUserCommandHandler(IUnitOfWork unitOfWork, IUserContextService userContextService)
        {
            _unitOfWork = unitOfWork;
            _userContextService = userContextService;
        }
        public async Task<ResponseModel<bool>> Handle(CreateUserReportUserCommand request, CancellationToken cancellationToken)
        {
            await _unitOfWork.BeginTransactionAsync();
            try
            {
                var userId = _userContextService.UserId();
                var reportedUserId = request.ReportedUserId;
                var user = await _unitOfWork.UserRepository.GetByIdAsync(userId);

                if (userId == reportedUserId)
                {
                    return ResponseFactory.Fail<bool>("Bạn không thể tự báo cáo chính mình.", 400);
                }
                // Kiểm tra xem người dùng đã báo cáo người dùng này chưa
                var existingReports = await _unitOfWork.UserReportRepository.GetReportsByUserIdAsync(reportedUserId);

                if (existingReports.Any(r => r.ReportedByUserId == userId)) // phải so với ReportedByUserId
                {
                    return ResponseFactory.Fail<bool>("Bạn đã báo cáo người dùng này trước đó.", 400);
                }
                if (user == null)
                    return ResponseFactory.Fail<bool>("Người dùng không tồn tại", 404);
                if (user.Status == "Suspended")
                    return ResponseFactory.Fail<bool>("Tài khoản đang bị tạm ngưng", 403);
                // Tạo đối tượng report mới
                var report = new UserReport(request.ReportedUserId, _userContextService.UserId(), request.Reason);

                await _unitOfWork.UserReportRepository.AddAsync(report);
                await _unitOfWork.SaveChangesAsync();
                await _unitOfWork.CommitTransactionAsync();
                return ResponseFactory.Success<bool>("báo cáo người dùng thành công.", 400);
            }
            catch (Exception ex)
            {
                await _unitOfWork.RollbackTransactionAsync();
                return ResponseFactory.Error<bool>("Failed to report user", 400, ex);
            }
            
        }
    }
}
