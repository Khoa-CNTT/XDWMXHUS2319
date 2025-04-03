
using Application.DTOs.RidePost;
using Application.Interface.Api;
using Application.Interface.ContextSerivce;
using Application.Services;
using static Domain.Common.Helper;

namespace Application.CQRS.Commands.RidePosts
{
    public class CreateRidePostCommandHandler : IRequestHandler<CreateRidePostCommand, ResponseModel<ResponseRidePostDto>>
    {
        private readonly IUserContextService _userContextService;
        private readonly IUnitOfWork _unitOfWork;
        private readonly IGeminiService _geminiService;
        private readonly IRidePostService _ridePostService;
        private readonly IMapService _mapService;
        private readonly MLService _mLService;
        public CreateRidePostCommandHandler(IUnitOfWork unitOfWork,
            MLService mLService, IUserContextService userContextService,
            IGeminiService geminiService, IRidePostService postService,IMapService mapService)
        {
            _unitOfWork = unitOfWork;
            _mLService = mLService;
            _userContextService = userContextService;
            _geminiService = geminiService;
            _ridePostService = postService;
            _mapService = mapService;
        }
        public async Task<ResponseModel<ResponseRidePostDto>> Handle(CreateRidePostCommand request, CancellationToken cancellationToken)
        {
            // Validate request cơ bản
            if (request == null)
                return ResponseFactory.Fail<ResponseRidePostDto>("Request is null", 400);

            if (request.StartTime < DateTime.UtcNow)
                return ResponseFactory.Fail<ResponseRidePostDto>("Start time must be greater than current time", 400);

            if (request.StartLocation == request.EndLocation)
                return ResponseFactory.Fail<ResponseRidePostDto>("Start and end locations must be different", 400);

            var userId = _userContextService.UserId();
            if (userId == Guid.Empty)
                return ResponseFactory.Fail<ResponseRidePostDto>("User not found", 404);

            await _unitOfWork.BeginTransactionAsync();
            try
            {
                // Xử lý location
                string? startLocation = await ProcessLocationAsync(request.StartLocation);
                string? endLocation = await ProcessLocationAsync(request.EndLocation);

                if (string.IsNullOrEmpty(startLocation) || string.IsNullOrEmpty(endLocation))
                    return ResponseFactory.Fail<ResponseRidePostDto>("Invalid location format", 400);

                // Tạo ride post
                var ridePost = new RidePost(userId, request.Content, startLocation, endLocation, request.StartLocation, request.EndLocation, request.StartTime, request.PostType);

                // Validate content
                string contentToValidate = $"StartLocation: {startLocation} - EndLocation: {endLocation} - StartTime: {request.StartTime}";
                bool isContentValid = await _geminiService.ValidatePostContentAsync(contentToValidate);
                // 🛑 Kiểm duyệt bài đăng bằng ML.NET
                //bool isValid = PostValidator.IsValid( post.Content , _mLService.Predict);
                //if (!isValid)
                //{
                //    post.RejectAI();
                //    await _unitOfWork.RollbackTransactionAsync();
                //    return ResponseFactory.Fail<ResponsePostDto>("Content is not valid", 400);
                //}
                //post.Approve();
                await _unitOfWork.RidePostRepository.AddAsync(ridePost);
                await _unitOfWork.SaveChangesAsync();

                if (!isContentValid)
                {
                    await _unitOfWork.CommitTransactionAsync();
                    return ResponseFactory.Fail<ResponseRidePostDto>(
                        "Warning! Content is not accepted! If you violate it again, your reputation will be deducted!!",
                        400);
                }

                await _unitOfWork.CommitTransactionAsync();

                // Tạo response DTO
                return ResponseFactory.Success(
                    new ResponseRidePostDto
                    {
                        Id = ridePost.Id,
                        UserId = ridePost.UserId,
                        StartLocation = startLocation,
                        EndLocation = endLocation,
                        LatLonStart = request.StartLocation,
                        LatLonEnd = request.EndLocation,
                        StartTime = FormatUtcToLocal(ridePost.StartTime),
                        PostType = ridePost.PostType,
                        Status = ridePost.Status,
                        CreatedAt = FormatUtcToLocal(ridePost.CreatedAt)
                    },
                    "Create Post Success",
                    200);
            }
            catch (Exception e)
            {
                await _unitOfWork.RollbackTransactionAsync();
                return ResponseFactory.Fail<ResponseRidePostDto>(e.Message, 500);
            }
        }

        // Helper method để xử lý location
        private async Task<string?> ProcessLocationAsync(string location)
        {
            if (string.IsNullOrEmpty(location))
                return null;

            // Kiểm tra xem có phải tọa độ không
            var coordinates = location.Split(',');
            if (coordinates.Length == 2 &&
                double.TryParse(coordinates[0].Trim(), out double lat) &&
                double.TryParse(coordinates[1].Trim(), out double lon))
            {
                return await _mapService.GetAddressFromCoordinatesAsync(lat, lon);
            }

            // Nếu không phải tọa độ, giả sử là tên địa chỉ
            // Có thể thêm validation hoặc chuyển đổi sang tọa độ nếu cần
            return location;
        }
    }
}
