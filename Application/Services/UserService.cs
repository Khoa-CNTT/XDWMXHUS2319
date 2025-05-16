using Application.DTOs.AdminUserManagement;
using Application.DTOs.User;
using Application.Model;
using Domain.Entities;
namespace Application.Services
{
    public class UserService : IUserService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IEmailService _emailService;
        private readonly IUserContextService _userContextService;
        public UserService(IUnitOfWork unitOfWork, IEmailService emailService, IUserContextService userContextService)
        {
            _unitOfWork = unitOfWork;
            _emailService = emailService;
            _userContextService = userContextService;
        }
        public UserResponseDto MapUserToUserResponseDto(User user)
        {
            return new UserResponseDto
            {
                FullName = user.FullName,
                Email = user.Email,
                CreatedAt = user.CreatedAt
            };
        }
        public async Task<bool> CheckEmailExistsAsync(string email)
        {
            //if (!email.EndsWith("@.edu.dtu.vn",StringComparison.OrdinalIgnoreCase)
            //    || !email.EndsWith("@.edu.dtu.vn", StringComparison.OrdinalIgnoreCase)) {
            //    return false;
            //}
            if(string.IsNullOrEmpty(email) || string.IsNullOrWhiteSpace(email))
            {
                return false;
            }
            return await _unitOfWork.UserRepository.GetExsitsEmailAsync(email);
        }

        public async Task<string> HashPasswordAsync(string password)
        {
            return await Task.Run(() => BCrypt.Net.BCrypt.HashPassword(password, 12));
        }

        public async Task<string?> SendVerifiEmailAsync(Guid userId, string email)
        {
            try
            {
                var token = await GenerateTokenAsync(userId);
                // Tạo link xác minh
                var verificationLink = $"https://localhost:7053/api/auth/verify-email?token={token}";

                // Tạo nội dung HTML đẹp mắt
                var subject = "Xác nhận địa chỉ email của bạn";
                var body = $@"
<!DOCTYPE html>
<html>
<head>
    <meta charset='UTF-8'>
    <title>Xác nhận Email</title>
    <style>
        body {{
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
        }}
        .header {{
            background-color: #4CAF50;
            color: white;
            padding: 20px;
            text-align: center;
            border-radius: 5px 5px 0 0;
        }}
        .content {{
            padding: 20px;
            background-color: #f9f9f9;
            border-radius: 0 0 5px 5px;
        }}
        .button {{
            display: inline-block;
            padding: 10px 20px;
            background-color: #4CAF50;
            color: white !important;
            text-decoration: none;
            border-radius: 5px;
            margin: 20px 0;
        }}
        .footer {{
            margin-top: 20px;
            font-size: 12px;
            color: #777;
            text-align: center;
        }}
    </style>
</head>
<body>
    <div class='header'>
        <h1>Xác nhận địa chỉ email</h1>
    </div>
    <div class='content'>
        <p>Xin chào,</p>
        <p>Cảm ơn bạn đã đăng ký tài khoản. Vui lòng nhấp vào nút bên dưới để xác nhận địa chỉ email của bạn:</p>
        
        <p style='text-align: center;'>
            <a href='{verificationLink}' class='button'>Xác nhận Email</a>
        </p>
        
        <p>Nếu nút không hoạt động, bạn có thể sao chép và dán liên kết sau vào trình duyệt của mình:</p>
        <p><a href='{verificationLink}'>{verificationLink}</a></p>
        
        <p>Trân trọng,<br>Đội ngũ hỗ trợ</p>
    </div>
    <div class='footer'>
        <p>Nếu bạn không yêu cầu email này, vui lòng bỏ qua nó.</p>
    </div>
</body>
</html>";

                // Gửi email với nội dung HTML
                bool isSuccess = await _emailService.SendEmailHtmlAsync(email, subject, body);
                if (isSuccess)
                {
                    return token;
                }
                else
                {
                    return null;
                }
            }
            catch
            {
                return null;
            }
        }
        public async Task<bool> SendEmailAsync(string email, string subject, string body)
        {
            try
            {
                return await _emailService.SendEmailAsync(email, subject, body);
            }
            catch
            {
                return false;
            }
        }
        public async Task<string> GenerateTokenAsync(Guid userId)
        {
            return await TokenVerifyEmailProvider.GenerateToken(userId);
        }

        public async Task<User?> GetByIdAsync(Guid userId)
        {
            return await _unitOfWork.UserRepository.GetByIdAsync(userId);
        }

        public async Task<bool> VerifyPasswordAsync(string hashedPassword, string providedPassword)
        {
            return  BCrypt.Net.BCrypt.Verify(providedPassword, hashedPassword);
        }
    


        public async Task<ResponseModel<UserDto>> BlockUserAsync(Guid userId, DateTime blockUntil)
        {
            var user = await _unitOfWork.UserRepository.GetByIdAsync(userId);

            // Kiểm tra nếu người dùng không tồn tại
            if (user == null)
                return ResponseFactory.Fail<UserDto>("Người dùng không tồn tại", 404);

            // Kiểm tra nếu người dùng đã bị block và blockUntil vẫn còn hiệu lực
            if (user.BlockedUntil.HasValue && user.BlockedUntil.Value > DateTime.Now)
            {
                return ResponseFactory.Fail<UserDto>("Người dùng đã bị block và thời gian block vẫn còn hiệu lực", 400);
            }

            // Kiểm tra nếu thời gian blockUntil không hợp lệ (thời gian đã qua)
            if (blockUntil <= DateTime.Now)
            {
                return ResponseFactory.Fail<UserDto>("Thời gian block không hợp lệ, phải là thời gian trong tương lai", 400);
            }

            // Kiểm tra trạng thái người dùng (ví dụ: nếu người dùng đã bị suspended, không thể block)
            if (user.Status == "Suspended") // So sánh với giá trị chuỗi "Suspended"
            {
                return ResponseFactory.Fail<UserDto>("Người dùng đang bị suspend, không thể block", 400);
            }

            // Cập nhật trạng thái block cho người dùng
            user.BlockUntil(blockUntil); // Gọi phương thức BlockUntil của người dùng

            // Lưu thay đổi vào cơ sở dữ liệu
            await _unitOfWork.UserRepository.UpdateAsync(user);
            await _unitOfWork.SaveChangesAsync();

            // Map User entity to UserDto
            var userDto = Mapping.MapToUserDto(user);

            return ResponseFactory.Success(userDto, "Block người dùng thành công", 200);
        }





        public async Task<ResponseModel<UserDto>> SuspendUserAsync(Guid userId, DateTime suspendUntil)
        {
            var user = await _unitOfWork.UserRepository.GetByIdAsync(userId);

            // Kiểm tra nếu người dùng không tồn tại
            if (user == null)
                return ResponseFactory.Fail<UserDto>("Người dùng không tồn tại", 404);

            // Kiểm tra nếu người dùng đã bị suspend và suspendUntil vẫn còn hiệu lực
            if (user.SuspendedUntil.HasValue && user.SuspendedUntil.Value > DateTime.Now)
            {
                return ResponseFactory.Fail<UserDto>("Người dùng đã bị suspend và thời gian suspend vẫn còn hiệu lực", 400);
            }

            // Kiểm tra nếu thời gian suspendUntil không hợp lệ (thời gian đã qua)
            if (suspendUntil <= DateTime.Now)
            {
                return ResponseFactory.Fail<UserDto>("Thời gian suspend không hợp lệ, phải là thời gian trong tương lai", 400);
            }

            // Kiểm tra trạng thái người dùng (ví dụ: nếu người dùng đã bị block, không thể suspend)
            if (user.Status == "Blocked") // So sánh với giá trị chuỗi "Blocked"
            {
                return ResponseFactory.Fail<UserDto>("Người dùng đang bị block, không thể suspend", 400);
            }

            // Cập nhật trạng thái suspend cho người dùng
            user.SuspendUntil(suspendUntil); // Gọi phương thức SuspendUntil của người dùng

            // Lưu thay đổi vào cơ sở dữ liệu
            await _unitOfWork.UserRepository.UpdateAsync(user);
            await _unitOfWork.SaveChangesAsync();

            // Map User entity to UserDto
            var userDto = Mapping.MapToUserDto(user);

            return ResponseFactory.Success(userDto, "Suspend người dùng thành công", 200);
        }

        public async Task<ResponseModel<UserDto>> UnblockUserAsync(Guid userId)
        {
            var user = await _unitOfWork.UserRepository.GetByIdAsync(userId);

            // Kiểm tra nếu người dùng không tồn tại
            if (user == null)
                return ResponseFactory.Fail<UserDto>("Người dùng không tồn tại", 404);

            // Kiểm tra trạng thái người dùng (nếu người dùng đã bị suspend hoặc không có thời gian block, không thể unblock)
            if (user.Status == "Suspended")
            {
                return ResponseFactory.Fail<UserDto>("Người dùng đang bị suspend, không thể unblock", 400);
            }

            // Cập nhật trạng thái người dùng thành "Active"
            user.MarkAsActive();

            // Lưu thay đổi vào cơ sở dữ liệu
            await _unitOfWork.UserRepository.UpdateAsync(user);
            await _unitOfWork.SaveChangesAsync();

            

            return ResponseFactory.Success<UserDto>( "Unblock người dùng thành công", 200);
        }



        public async Task<ResponseModel<List<UserDto>>> GetUsersAsync(string? status = null, string? search = null)
        {
            List<User> users;

            // Nếu có từ khóa tìm kiếm
            if (!string.IsNullOrWhiteSpace(search))
            {
                users = await _unitOfWork.UserRepository.SearchUsersAsync(search);

                // Nếu không tìm thấy người dùng
                if (!users.Any())
                {
                    return ResponseFactory.Fail<List<UserDto>>("Không tìm thấy người dùng nào với từ khóa này.",404);
                }
            }
            else
            {
                users = await _unitOfWork.UserRepository.GetAllUsersAsync();
            }

            // Nếu có lọc trạng thái
            if (!string.IsNullOrWhiteSpace(status))
            {
                if (Enum.TryParse<UserStatus>(status, true, out var userStatus))
                {
                    users = users.Where(u => u.Status == userStatus.ToString()).ToList();

                    // Nếu không tìm thấy người dùng với trạng thái này
                    if (!users.Any())
                    {
                        throw new Exception($"Không có người dùng nào với trạng thái {userStatus}.");
                    }
                }
                else
                {
                    throw new Exception("Trạng thái không hợp lệ.");
                }
            }

            // Nếu có trạng thái người dùng không hoạt động (ví dụ: Blocked, Suspended)
            users = users.Where(u => u.Status != UserStatus.Blocked.ToString() && u.Status != UserStatus.Suspended.ToString()).ToList();
            var userDtos = users.Select(Mapping.MapToUserDto).ToList();

            // Bọc kết quả thành ResponseModel
            return ResponseFactory.Success(userDtos, "Lấy danh sách người dùng thành công", 200);
        }


        public async Task<ResponseModel<UserDto>> GetUserDetailsAsync(Guid userId)
        {
            var user = await _unitOfWork.UserRepository.GetUserByIdAsync(userId);

            if (user == null || !user.IsVerifiedEmail)
            {
                throw new Exception("Người dùng không tồn tại hoặc chưa xác thực email.");
            }

            // Không cần dùng Select, trực tiếp ánh xạ đối tượng user thành UserDto
            var userDto = Mapping.MapToUserDto(user);

            // Trả về kết quả trong ResponseModel
            return ResponseFactory.Success(userDto, "Lấy chi tiết người dùng thành công", 200);
        }

        public async Task<ResponseModel<List<UserManagerDto>>> GetAllUsersAsync()
        {
            // Lấy tất cả người dùng từ repository
            var users = await _unitOfWork.UserRepository.GetAllUsersAsync();
            var alluser = users.Select(Mapping.MapToUserAdminDto).ToList();
            return ResponseFactory.Success(alluser, "Lấy danh sách người dùng thành công", 200);
        }
    }  

}
