using Domain.Interface;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.CQRS.Commands.EmailToken
{
    public class VerifyEmailCommandHandler : IRequestHandler<VerifyEmailCommand, ResponseModel<bool>>
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IUserService _userService;

        public VerifyEmailCommandHandler(IUserService userService, IUnitOfWork unitOfWork)
        {
            _userService = userService;
            _unitOfWork = unitOfWork;
        }
        public async Task<ResponseModel<bool>> Handle(VerifyEmailCommand request, CancellationToken cancellationToken)
        {
            await _unitOfWork.BeginTransactionAsync();
            try
            {
                // 🔍 Kiểm tra token có hợp lệ không
                var emailToken = await _unitOfWork.EmailTokenRepository.GetByTokenAsync(request.Token);
                if (emailToken == null || emailToken.IsUsed || emailToken.ExpiryDate < DateTime.UtcNow)
                {
                    await _unitOfWork.RollbackTransactionAsync();
                    return ResponseFactory.Fail<bool>("Invalid token",400);
                }

                // 📌 Xác minh thành công -> Cập nhật trạng thái user
                var user = await _unitOfWork.UserRepository.GetByIdAsync(emailToken.UserId);
                if (user == null)
                {
                    await _unitOfWork.RollbackTransactionAsync();
                    return ResponseFactory.Fail<bool>("User not found",404);
                }
                if (user.IsVerifiedEmail)
                {
                    await _unitOfWork.RollbackTransactionAsync();
                    return ResponseFactory.Fail<bool>("Email already verified",400);
                }
                if (emailToken.Token != request.Token)
                {
                    await _unitOfWork.RollbackTransactionAsync();
                    return ResponseFactory.Fail<bool>("Invalid token",400);
                }

                user.VerifyEmail(); // 🛠 Cập nhật trạng thái đã xác minh
                emailToken.MarkAsUsed(); // 🔄 Đánh dấu token đã sử dụng
                emailToken.IsUsedToken(); // 🔄 Đánh dấu token đã sử dụng
                // ❌ Xóa token sau khi xác minh thành công
                await _unitOfWork.EmailTokenRepository.DeleteAsync(emailToken.Id);
                await _unitOfWork.SaveChangesAsync();
                await _unitOfWork.CommitTransactionAsync();
                return ResponseFactory.Success(true, "Email verified successfully",200);
            }
            catch (Exception ex) {
                return ResponseFactory.Fail<bool>(ex.Message,400);
            }
        
        }

    }

}
