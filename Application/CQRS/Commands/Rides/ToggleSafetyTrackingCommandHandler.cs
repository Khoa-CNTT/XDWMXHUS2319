using Application.Interface.ContextSerivce;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.CQRS.Commands.Rides
{
    public class ToggleSafetyTrackingCommandHandler : IRequestHandler<ToggleSafetyTrackingCommand, ResponseModel<bool>>
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IUserContextService _userContextService;
        public ToggleSafetyTrackingCommandHandler(IUnitOfWork unitOfWork,IUserContextService userContextService)
        {
            _unitOfWork = unitOfWork;
            _userContextService = userContextService;
        }

        public async Task<ResponseModel<bool>> Handle(ToggleSafetyTrackingCommand request, CancellationToken cancellationToken)
        {
            var userId = _userContextService.UserId();
            var ride = await _unitOfWork.RideRepository.GetRideByUserIdAsync(userId);
            if (ride == null) {
                return ResponseFactory.Fail<bool>("Ride does't exsist", 404);
            }
            if(ride.Status!= Domain.Common.Enums.StatusRideEnum.Accepted)
            {
                return ResponseFactory.Fail<bool>("Ride status does't Accepted", 404);
            }
            if (ride.IsSafetyTrackingEnabled) {
                return ResponseFactory.Fail<bool>("Is Safety Tracking Enabled is TRUE,no change", 200);
            }
            await _unitOfWork.BeginTransactionAsync();
            try
            {
                ride.ChangeIsSafetyTrackingEnabled(true);
                await _unitOfWork.RideRepository.UpdateAsync(ride);
                await _unitOfWork.SaveChangesAsync();
                await _unitOfWork.CommitTransactionAsync();
                return ResponseFactory.Success<bool>("Change Is Safety Tracking Enabled TRUE", 200);
            }
            catch (Exception ex) {
                await _unitOfWork.RollbackTransactionAsync();
                return ResponseFactory.Error<bool>("Ride does't exsist", 404,ex);

            }
            
        }
    }
}
