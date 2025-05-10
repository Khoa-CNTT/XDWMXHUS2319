using Application.DTOs.User;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.CQRS.Commands.Users
{
    public class UpdateUserInformationCommandHandler : IRequestHandler<UpdateUserInformationCommand, ResponseModel<UserUpdateInformationDto>>
    {
        private readonly IUserRepository _userRepository;
        private readonly IUserContextService _userContextService;
        private readonly IUnitOfWork _unitOfWork;
        public UpdateUserInformationCommandHandler(IUserRepository userRepository, IUserContextService userContextService, IUnitOfWork unitOfWork)
        {
            _userRepository = userRepository;
            _userContextService = userContextService;
            _unitOfWork = unitOfWork;
        }

        public async Task<ResponseModel<UserUpdateInformationDto>> Handle(UpdateUserInformationCommand request, CancellationToken cancellationToken)
        {
            // 🔐 Lấy UserId từ Token
            var userIdFromToken = _userContextService.UserId();
            if (userIdFromToken == Guid.Empty)
            {
                return ResponseFactory.Fail<UserUpdateInformationDto>("Unauthorized", 401);
            }

            // 🔍 Lấy thông tin người dùng từ Database
            var user = await _userRepository.GetUserByIdAsync(userIdFromToken);
            if (user == null)
            {
                return ResponseFactory.Fail<UserUpdateInformationDto>("Không tìm thấy người dùng", 404);
            }

            await _unitOfWork.BeginTransactionAsync();
            try
            {
                // Cập nhật thông tin người dùng
                user.UpdateInformation(request.PhoneNumber, request.PhoneRelativeNumber, request.Gender);
                await _userRepository.UpdateAsync(user);
                await _unitOfWork.SaveChangesAsync();
                await _unitOfWork.CommitTransactionAsync();
                // Trả về kết quả sau khi cập nhật
                return ResponseFactory.Success(Mapping.MaptoUserInformationDto(user), "Cập nhật thông tin thành công", 200);
            }
            catch (Exception ex)
            {
                await _unitOfWork.RollbackTransactionAsync();
                return ResponseFactory.Fail<UserUpdateInformationDto>(ex.Message, 500);
            }
        }
    }
}
