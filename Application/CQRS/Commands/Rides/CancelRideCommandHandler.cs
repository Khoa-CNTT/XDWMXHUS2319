
namespace Application.CQRS.Commands.Rides
{
    public class CancelRideCommandHandler : IRequestHandler<CancelRideCommand, ResponseModel<bool>>
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IUserContextService _userContextService;

        public CancelRideCommandHandler(IUnitOfWork unitOfWork, IUserContextService userContextService)
        {
             _unitOfWork = unitOfWork;
            _userContextService = userContextService;
        }

        public async Task<ResponseModel<bool>> Handle(CancelRideCommand request, CancellationToken cancellationToken)
        {
            // Retrieve the ride by ID
            var userId = _userContextService.UserId();
            if (userId == Guid.Empty)
            {
                return ResponseFactory.Fail<bool>("User not found", 404);
            }
            if (request.RideId == Guid.Empty)
            {
                return ResponseFactory.Fail<bool>("Ride ID is invalid", 400);
            }
            // Check if the ride exists
            var ride = await _unitOfWork.RideRepository.GetByIdAsync(request.RideId);
            if (ride == null)
            {
                return ResponseFactory.Fail<bool>("Ride not found", 404);
            }
            if (ride.PassengerId != userId && ride.DriverId != userId)
            {
                return ResponseFactory.Fail<bool>("You are not authorized to cancel this ride", 403);
            }
            if (ride.Status == StatusRideEnum.Completed)
            {
                return ResponseFactory.Fail<bool>("The Ride cannot be canceled because it has already been completed", 400);
            }
            // Update the ride in the repository
            var ridePost = await _unitOfWork.RidePostRepository.GetByIdAsync(ride.RidePostId);
            if (ridePost == null)
            {
                return ResponseFactory.Fail<bool>("Ride post not found", 404);
            }
            await _unitOfWork.BeginTransactionAsync();
            try
            {
                ride.CancelRide();  
                ridePost.RevertToOpen();
                await _unitOfWork.RideRepository.UpdateAsync(ride);
                // Save changes to the database
                await _unitOfWork.SaveChangesAsync();
                await _unitOfWork.CommitTransactionAsync();
                return ResponseFactory.Success(true, "Hủy chuyến đi thành công", 200);
            }
            catch(Exception ex)
            {
                await _unitOfWork.RollbackTransactionAsync();
                return ResponseFactory.Error<bool>("Error: ", 500, ex);
            }
        }
    }
}