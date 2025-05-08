using Application.DTOs.RidePost;
using Application.Interface.Api;
using Application.Interface.ContextSerivce;
using static Domain.Common.Enums;
using static Domain.Common.Helper;

namespace Application.CQRS.Commands.RidePosts
{
    public class UpdateRidePostCommandHandler : IRequestHandler<UpdateRidePostCommand, ResponseModel<ResponseRidePostDto>>
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IUserContextService _userContextService;
        private readonly IGeminiService _geminiService;
        private readonly IMapService _mapService;

        public UpdateRidePostCommandHandler(
            IUnitOfWork unitOfWork,
            IUserContextService userContextService,
            IGeminiService geminiService,
            IMapService mapService)
        {
            _unitOfWork = unitOfWork;
            _userContextService = userContextService;
            _geminiService = geminiService;
            _mapService = mapService;
        }
        public async Task<ResponseModel<ResponseRidePostDto>> Handle(UpdateRidePostCommand request, CancellationToken cancellationToken)
        {
            // Validate request cơ bản
            if (request == null || request.Id == Guid.Empty)
                return ResponseFactory.Fail<ResponseRidePostDto>("Yêu cầu hoặc ID bài đăng không hợp lệ", 400);

            // Kiểm tra user
            var userId = _userContextService.UserId();
            if (userId == Guid.Empty)
                return ResponseFactory.Fail<ResponseRidePostDto>("Không tìm thấy người dùng", 404);

            // Lấy bài post từ database
            var ridePost = await _unitOfWork.RidePostRepository.FindAsync(request.Id);
            if (ridePost == null)
                return ResponseFactory.Fail<ResponseRidePostDto>("Không tìm thấy bài Ride", 404);

            // Kiểm tra quyền chỉnh sửa
            if (ridePost.UserId != userId)
                return ResponseFactory.Fail<ResponseRidePostDto>("Bạn không có quyền chỉnh sửa bài viết", 403);

            // Kiểm tra trạng thái bài post
            if (ridePost.Status != RidePostStatusEnum.open)
                return ResponseFactory.Fail<ResponseRidePostDto>("Không thể chỉnh sửa bài viết chưa mở", 400);

            // Kiểm tra nếu không có trường nào được cung cấp để cập nhật
            if (string.IsNullOrEmpty(request.Content) &&
                string.IsNullOrEmpty(request.StartLocation) &&
                string.IsNullOrEmpty(request.EndLocation) &&
                !request.StartTime.HasValue)
            {
                return ResponseFactory.Fail< ResponseRidePostDto>("Không có trường nào được cung cấp để cập nhật", 200);
            }

            // Theo dõi các thay đổi
            bool hasChanges = false;

            // Xử lý các trường được cung cấp
            if (!string.IsNullOrEmpty(request.Content) && request.Content != ridePost.Content)
            {
                ridePost.UpdateContent(request.Content);
                hasChanges = true;
            }

            string? startLocation = null;
            if (!string.IsNullOrEmpty(request.StartLocation) && request.StartLocation != ridePost.LatLonStart)
            {
                startLocation = await ProcessLocationAsync(request.StartLocation);
                if (string.IsNullOrEmpty(startLocation))
                    return ResponseFactory.Fail<ResponseRidePostDto>("Invalid start location", 400);
                if (startLocation != ridePost.StartLocation || request.StartLocation != ridePost.LatLonStart)
                {
                    ridePost.UpdateStartLocation(startLocation, request.StartLocation);
                    hasChanges = true;
                }
            }

            string? endLocation = null;
            if (!string.IsNullOrEmpty(request.EndLocation) && request.EndLocation != ridePost.LatLonEnd)
            {
                endLocation = await ProcessLocationAsync(request.EndLocation);
                if (string.IsNullOrEmpty(endLocation))
                    return ResponseFactory.Fail<ResponseRidePostDto>("Invalid end location", 400);
                if (endLocation != ridePost.EndLocation || request.EndLocation != ridePost.LatLonEnd)
                {
                    ridePost.UpdateEndLocation(endLocation, request.EndLocation);
                    hasChanges = true;
                }
            }

            if (request.StartTime.HasValue && request.StartTime.Value != ridePost.StartTime)
            {
                ridePost.UpdateStartTime(request.StartTime.Value);
                hasChanges = true;
            }

            // Nếu không có thay đổi, trả về response không cần lưu
            if (!hasChanges)
            {
                return ResponseFactory.Fail<ResponseRidePostDto>("Không có gì để thay đổi", 200);
            }

            await _unitOfWork.BeginTransactionAsync();
            try
            {
                // Validate nội dung
                string contentToValidate = $"StartLocation: {ridePost.StartLocation} - EndLocation: {ridePost.EndLocation} - StartTime: {ridePost.StartTime}";
                bool isContentValid = await _geminiService.ValidatePostContentAsync(request.Content);
                if (!isContentValid)
                {
                    await _unitOfWork.CommitTransactionAsync();
                    return ResponseFactory.Fail<ResponseRidePostDto>(
                        "Warning! Content is not accepted! If you violate it again, your reputation will be deducted!!",
                        400);
                }

                // Lưu thay đổi
                await _unitOfWork.SaveChangesAsync();
                await _unitOfWork.CommitTransactionAsync();

                // Tạo response DTO
                return ResponseFactory.Success(
                    new ResponseRidePostDto
                    {
                        Id = ridePost.Id,
                        UserId = ridePost.UserId,
                        UserName = ridePost.User?.FullName ?? "unknown",
                        UserAvatar = $"{Constaint.baseUrl}{ridePost.User?.ProfilePicture}" ?? "unknown",
                        Content = ridePost.Content,
                        StartLocation = ridePost.StartLocation,
                        EndLocation = ridePost.EndLocation,
                        LatLonStart = ridePost.LatLonStart,
                        LatLonEnd = ridePost.LatLonEnd,
                        StartTime = FormatUtcToLocal(ridePost.StartTime),
                        PostType = ridePost.PostType,
                        Status = ridePost.Status,
                        CreatedAt = FormatUtcToLocal(ridePost.CreatedAt)
                    },
                    "Update Post Success",
                    200);
            }
            catch (Exception e)
            {
                await _unitOfWork.RollbackTransactionAsync();
                return ResponseFactory.Fail<ResponseRidePostDto>(e.Message, 500);
            }
        }

        private async Task<string?> ProcessLocationAsync(string location)
        {
            if (string.IsNullOrEmpty(location))
                return null;

            var coordinates = location.Split(',');
            if (coordinates.Length == 2 &&
                double.TryParse(coordinates[0].Trim(), out double lat) &&
                double.TryParse(coordinates[1].Trim(), out double lon))
            {
                return await _mapService.GetAddressFromCoordinatesAsync(lat, lon);
            }
            return location;
        }
    }
}