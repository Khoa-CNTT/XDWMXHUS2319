
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
        private readonly MLService _mLService;
        public CreateRidePostCommandHandler(IUnitOfWork unitOfWork,
            MLService mLService, IUserContextService userContextService,
            IGeminiService geminiService, IRidePostService postService)
        {
            _unitOfWork = unitOfWork;
            _mLService = mLService;
            _userContextService = userContextService;
            _geminiService = geminiService;
            _ridePostService = postService;
        }
        public async Task<ResponseModel<ResponseRidePostDto>> Handle(CreateRidePostCommand request, CancellationToken cancellationToken)
        {
            if (request.StartTime < DateTime.UtcNow)
            {
                return ResponseFactory.Fail<ResponseRidePostDto>("Start time must be greater than current time", 400);
            }
            if (request.StartLocation == request.EndLocation)
            {
                return ResponseFactory.Fail<ResponseRidePostDto>("Start location and end location must be different", 400);
            }
            if (request == null)
            {
                return ResponseFactory.Fail<ResponseRidePostDto>("Request is null", 400);
            }
            await _unitOfWork.BeginTransactionAsync();
            try
            {
                var userId = _userContextService.UserId();
                if (userId == Guid.Empty)
                    return ResponseFactory.Fail<ResponseRidePostDto>("User not found", 404);

                var ridePost = new RidePost(userId, request.StartLocation, request.EndLocation, request.StartTime, request.PostType);
                var content = $"StartLocation: {request.StartLocation} - EndLocation: {request.EndLocation} - StartTime: {request.StartTime}";
                //kiểm tra xem bài đăng có hợp lệ không bằng Genimi
                var result = await _geminiService.ValidatePostContentAsync(content);
                if (!result)
                {
                    await _unitOfWork.RidePostRepository.AddAsync(ridePost);
                    await _unitOfWork.SaveChangesAsync();
                    await _unitOfWork.CommitTransactionAsync();
                    return ResponseFactory.Fail<ResponseRidePostDto>("Warning! Content is not accepted! If you violate it again, your reputation will be deducted!!", 400);
                }
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
                await _unitOfWork.CommitTransactionAsync(); // Thêm dòng này để commit nếu hợp lệ

                var postDto = new ResponseRidePostDto
                {
                    Id = ridePost.Id,
                    UserId = ridePost.UserId,
                    StartLocation = ridePost.StartLocation,
                    EndLocation = ridePost.EndLocation,
                    StartTime =FormatUtcToLocal(ridePost.StartTime),
                    PostType = ridePost.PostType,
                    Status = ridePost.Status,
                    CreatedAt = FormatUtcToLocal(ridePost.CreatedAt)
                };
                return ResponseFactory.Success(postDto, "Create Post Success", 200);
            }
            catch (Exception e)
            {
                await _unitOfWork.RollbackTransactionAsync();
                return ResponseFactory.Fail<ResponseRidePostDto>(e.Message, 500);
            }
        }
    }
}
