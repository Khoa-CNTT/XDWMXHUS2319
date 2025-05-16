using Application.DTOs.User;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.CQRS.Commands.Users
{
    public class ForgotPasswordCommandHandler : IRequestHandler<ForgotPasswordCommand, ResponseModel<bool>>
    {
        private readonly IUserService _userService;
        private readonly IUnitOfWork _unitOfWork;
        public ForgotPasswordCommandHandler(IUserService userService, IUnitOfWork unitOfWork)
        {
            _userService = userService;
            _unitOfWork = unitOfWork;
        }
        public async Task<ResponseModel<bool>> Handle(ForgotPasswordCommand request, CancellationToken cancellationToken)
        {
            await _unitOfWork.BeginTransactionAsync();
            try
            {
                // Check if email exists
                var user = await _unitOfWork.UserRepository.GetUserByEmailAsync(request.Email);
                if (user == null)
                {
                    await _unitOfWork.RollbackTransactionAsync();
                    return ResponseFactory.Fail<bool>("User not found", 404);
                }

                // Generate reset token
                var token = await _userService.GenerateTokenAsync(user.Id);
                var resetLink = $"http://localhost:3000/reset-password?token={token}";

                // Save reset token
                var resetToken = new EmailVerificationToken(user.Id, token, DateTime.UtcNow.AddHours(1));
                await _unitOfWork.EmailTokenRepository.AddAsync(resetToken);

                // Create HTML email content
                var subject = "🔐 Yêu cầu đặt lại mật khẩu";
                var body = $@"
<!DOCTYPE html>
<html>
<head>
    <meta charset='UTF-8'>
    <title>Đặt lại mật khẩu</title>
    <style>
        body {{
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
        }}
        .header {{
            background-color: #4285F4;
            color: white;
            padding: 25px;
            text-align: center;
            border-radius: 8px 8px 0 0;
        }}
        .content {{
            padding: 25px;
            background-color: #f9f9f9;
            border-radius: 0 0 8px 8px;
        }}
        .button {{
            display: inline-block;
            padding: 12px 24px;
            background-color: #4285F4;
            color: white !important;
            text-decoration: none;
            border-radius: 4px;
            margin: 20px 0;
            font-weight: bold;
        }}
        .info-box {{
            background-color: #e8f0fe;
            padding: 15px;
            border-left: 4px solid #4285F4;
            margin: 20px 0;
            border-radius: 4px;
        }}
        .footer {{
            margin-top: 25px;
            font-size: 12px;
            color: #777;
            text-align: center;
        }}
        .expiry-note {{
            color: #d32f2f;
            font-weight: bold;
        }}
    </style>
</head>
<body>
    <div class='header'>
        <h2>ĐẶT LẠI MẬT KHẨU</h2>
    </div>
    <div class='content'>
        <p>Xin chào {user.FullName},</p>
        <p>Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản của bạn.</p>
        
        <p style='text-align: center;'>
            <a href='{resetLink}' class='button'>ĐẶT LẠI MẬT KHẨU</a>
        </p>
        
        <div class='info-box'>
            <p>Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này hoặc liên hệ với bộ phận hỗ trợ nếu bạn nghi ngờ có hoạt động đáng ngờ.</p>
            <p class='expiry-note'>Lưu ý: Liên kết này sẽ hết hạn sau 1 giờ.</p>
        </div>
        
        <p>Nếu nút trên không hoạt động, bạn có thể sao chép và dán đường dẫn sau vào trình duyệt:</p>
        <p><a href='{resetLink}' style='word-break: break-all;'>{resetLink}</a></p>
        
        <p>Trân trọng,<br>Đội ngũ hỗ trợ</p>
    </div>
    <div class='footer'>
        <p>Đây là email tự động, vui lòng không trả lời.</p>
        <p>© {DateTime.Now.Year} Sharing System. All rights reserved.</p>
    </div>
</body>
</html>";

                // Send email
                var emailSent = await _userService.SendEmailAsync(user.Email, subject, body);

                if (!emailSent)
                {
                    await _unitOfWork.RollbackTransactionAsync();
                    return ResponseFactory.Fail<bool>("Failed to send reset email", 400);
                }

                await _unitOfWork.SaveChangesAsync();
                await _unitOfWork.CommitTransactionAsync();
                return ResponseFactory.Success(true, "Reset password email sent successfully", 200);
            }
            catch (Exception ex)
            {
                await _unitOfWork.RollbackTransactionAsync();
                return ResponseFactory.Error<bool>("Failed to process reset request", 400, ex);
            }
        }
    }
}
