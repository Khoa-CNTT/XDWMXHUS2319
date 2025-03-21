using Application.Interface.ContextSerivce;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using static Domain.Common.Enums;

namespace Application.CQRS.Commands.RidePosts
{
    public class CanceledStatusCommandHandler : IRequestHandler<CanceledStatusCommand, ResponseModel<bool>>
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IUserContextService _userContextService;
        public CanceledStatusCommandHandler(IUnitOfWork unitOfWork,IUserContextService userContextService)
        {
            _unitOfWork = unitOfWork;
            _userContextService = userContextService;
        }
        public async Task<ResponseModel<bool>> Handle(CanceledStatusCommand request, CancellationToken cancellationToken)
        {
            var userId =  _userContextService.UserId();
            //viết logic cập nhật trạng thái của ride post
            var ridePost = await _unitOfWork.RidePostRepository.GetByIdAsync(request.RideId);
            if (ridePost == null)
            {
                return ResponseFactory.Fail<bool>("Ride post not found", 404);
            }
            if (ridePost.Status == request.Status)
            {
                return ResponseFactory.Fail<bool>("Status is already " + request.Status, 400);
            }
            if (ridePost.UserId != userId)
            {
                return ResponseFactory.Fail<bool>("You are not the owner of this ride post", 403);
            }
            await _unitOfWork.BeginTransactionAsync();
            try
            {
                
                ridePost.Canceled();
                await _unitOfWork.RidePostRepository.UpdateAsync(ridePost);
                await _unitOfWork.SaveChangesAsync();
                await _unitOfWork.CommitTransactionAsync();
                return ResponseFactory.Success(true,"Change status success",200);
            }
            catch (Exception ex)
            {
                await _unitOfWork.RollbackTransactionAsync();
                return ResponseFactory.Fail<bool>(ex.Message, 500);
            }
           

        }
    }
}
