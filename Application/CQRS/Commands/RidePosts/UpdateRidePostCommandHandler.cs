using Application.DTOs.RidePost;
using Application.Interface.ContextSerivce;
using static Domain.Common.Enums;
using static Domain.Common.Helper;

namespace Application.CQRS.Commands.RidePosts
{
    public class UpdateRidePostCommandHandler : IRequestHandler<UpdateRidePostCommand, ResponseModel<ResponseRidePostDto>>
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IUserContextService _userContextService;
        public UpdateRidePostCommandHandler(IUnitOfWork unitOfWork,IUserContextService userContextService)
        {
            _unitOfWork = unitOfWork;
            _userContextService = userContextService;
        }
        public async Task<ResponseModel<ResponseRidePostDto>> Handle(UpdateRidePostCommand request, CancellationToken cancellationToken)
        {
            if (request.StartTime < DateTime.UtcNow)
            {
                return ResponseFactory.Fail<ResponseRidePostDto>("Start time must be greater than current time", 400);
            }
            if (request.StartLocation == request.EndLocation)
            {
                return ResponseFactory.Fail<ResponseRidePostDto>("Start location and end location must be different", 400);
            }
            if(request == null)
            {
                return ResponseFactory.Fail<ResponseRidePostDto>("Request is null", 400);
            }
            var userId = _userContextService.UserId();
            var ridePost = await _unitOfWork.RidePostRepository.GetByIdAsync(request.Id);

            if (ridePost == null)
            {
                return ResponseFactory.Fail<ResponseRidePostDto>("Ride post not found", 404);
            }
            if (ridePost.Status != RidePostStatusEnum.open)
            {
                return ResponseFactory.Fail<ResponseRidePostDto>("Ride post is not open", 400);
            }
            if (ridePost.UserId != userId)
            {
                return ResponseFactory.Fail<ResponseRidePostDto>("You are not authorized to update this ride post", 403);
            }
            await _unitOfWork.BeginTransactionAsync();
            try
            {
                ridePost.UpdateRidePost(request.StartLocation, request.EndLocation, request.StartTime);
                await _unitOfWork.RidePostRepository.UpdateAsync(ridePost);
                await _unitOfWork.SaveChangesAsync();
                await _unitOfWork.CommitTransactionAsync();
                return ResponseFactory.Success<ResponseRidePostDto>(new ResponseRidePostDto
                {
                    Id = ridePost.Id,
                    StartLocation = ridePost.StartLocation,
                    EndLocation = ridePost.EndLocation,
                    StartTime = FormatUtcToLocal(ridePost.StartTime),
                    PostType = ridePost.PostType,
                    Status = ridePost.Status,
                    CreatedAt = FormatUtcToLocal(ridePost.CreatedAt)
                }, "Update success", 200);

            }
            catch (Exception ex)
            {
                await _unitOfWork.RollbackTransactionAsync();
                return ResponseFactory.Error<ResponseRidePostDto>("Internal Server Error", 500,ex);

            }
        }
    }
}
