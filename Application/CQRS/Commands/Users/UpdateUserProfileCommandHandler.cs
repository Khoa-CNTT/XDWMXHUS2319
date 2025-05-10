using Application.DTOs.User;


namespace Application.CQRS.Commands.Users
{
    public class UpdateUserProfileCommandHandler : IRequestHandler<UpdateUserProfileCommand, ResponseModel<UserProfileDetailDto>>
    {
        private readonly IUserRepository _userRepository;
        private readonly IUserContextService _userContextService;
        private readonly IUnitOfWork _unitOfWork;
        private readonly IFileService _fileService;
        private readonly IRedisService _redisService;
        public UpdateUserProfileCommandHandler(IUserRepository userRepository, IUserContextService userContextService, IUnitOfWork unitOfWork, IFileService fileService, IRedisService redisService)
        {
            _userRepository = userRepository;
            _userContextService = userContextService;
            _unitOfWork = unitOfWork;
            _fileService = fileService;
            _redisService = redisService;
        }

        public async Task<ResponseModel<UserProfileDetailDto>> Handle(UpdateUserProfileCommand request, CancellationToken cancellationToken)
        {
            // 🔐 Lấy UserId từ Token
            var userIdFromToken = _userContextService.UserId();
            if (userIdFromToken == Guid.Empty)
            {
                return ResponseFactory.Fail<UserProfileDetailDto>("Unauthorized", 401);
            }

            // 🔍 Lấy thông tin người dùng từ Database
            var user = await _userRepository.GetUserByIdAsync(userIdFromToken);
            if (user == null)
            {
                return ResponseFactory.Fail<UserProfileDetailDto>("User not found", 404);
            }
            if (user.Status == "Suspended")
            {
                return ResponseFactory.Fail<UserProfileDetailDto>("Tài khoản đang bị tạm ngưng", 403);
            }
            // 🔄 Cập nhật thông tin người dùng
            string? newProfileImageUrl = user.ProfilePicture;

            if (request.ProfileImage != null && _fileService.IsImage(request.ProfileImage))
            {
                newProfileImageUrl = await _fileService.SaveFileAsync(request.ProfileImage, "images/profile/avatar", true);
            }
            string? newBackgroundImageUrl = user.BackgroundPicture;

            if (request.BackgroundImage != null && _fileService.IsImage(request.BackgroundImage))
            {
                newBackgroundImageUrl = await _fileService.SaveFileAsync(request.BackgroundImage, "images/profile/background", true);
            }

            await _unitOfWork.BeginTransactionAsync();
            try
            {
                // Cập nhật thông tin người dùng
                user.UpdateProfile(request.FullName, newProfileImageUrl, newBackgroundImageUrl, request.Bio);
                await _userRepository.UpdateAsync(user);
                await _unitOfWork.SaveChangesAsync();
                await _unitOfWork.CommitTransactionAsync();
                // Trả về kết quả sau khi cập nhật
                
                return ResponseFactory.Success(Mapping.MaptoUserprofileDetailDto(user), "Cập nhật hồ sơ thành công", 200);
            }
            catch (Exception ex)
            {
                await _unitOfWork.RollbackTransactionAsync();
                return ResponseFactory.Fail<UserProfileDetailDto>(ex.Message, 500);
            }
        }
    }
}
