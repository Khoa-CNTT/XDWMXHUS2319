using Application.Model;
using Microsoft.Extensions.Options;
using MimeKit;
using MimeKit.Text;
using Application.Interface;
using MailKit.Security;
using MailKit.Net.Smtp;
namespace Infrastructure.Email
{
    public class EmailService : IEmailService
    {
        private readonly SmtpSettings _smtpSettings;
        //private readonly TokenService _tokenService;

        public EmailService(IOptions<SmtpSettings> smtpSettings)
        {
            _smtpSettings = smtpSettings.Value;
        }

        public async Task<bool> SendEmailAsync(string toEmail, string subject, string body)
        {
            try
            {
                var email = new MimeMessage();
                email.From.Add(new MailboxAddress("Sharing System", _smtpSettings.FromEmail));
                email.To.Add(new MailboxAddress(" ", toEmail));
                email.Subject = subject;
                email.Body = new TextPart(TextFormat.Html) { Text = body };

                using var smtp = new MailKit.Net.Smtp.SmtpClient();
                await smtp.ConnectAsync(_smtpSettings.SmtpServer, _smtpSettings.SmtpPort, SecureSocketOptions.StartTls);
                await smtp.AuthenticateAsync(_smtpSettings.SmtpUser, _smtpSettings.SmtpPass);
                await smtp.SendAsync(email);
                await smtp.DisconnectAsync(true);
                return true;
            }
            catch  { 

                return false;
            }
            
        }
        public async Task<bool> SendEmailHtmlAsync(string toEmail, string subject, string body, string? recipientName = null, string? replyTo = null)
        {
            try
            {
                var email = new MimeMessage();

                // Thiết lập người gửi
                email.From.Add(new MailboxAddress("Sharing System", _smtpSettings.FromEmail));

                // Thiết lập người nhận (có thể thêm tên)
                email.To.Add(new MailboxAddress(recipientName ?? string.Empty, toEmail));

                // Thiết lập Reply-To nếu có
                if (!string.IsNullOrEmpty(replyTo))
                {
                    email.ReplyTo.Add(new MailboxAddress(string.Empty, replyTo));
                }

                email.Subject = subject;

                // Tạo phần thân email với hỗ trợ HTML và plain text fallback
                var builder = new BodyBuilder();
                builder.HtmlBody = body;

                // Tự động tạo plain text từ HTML cho các client không hỗ trợ HTML
                builder.TextBody = ConvertHtmlToPlainText(body);

                email.Body = builder.ToMessageBody();

                using var smtp = new MailKit.Net.Smtp.SmtpClient();

                // Thiết lập timeout
                smtp.Timeout = 30000; // 30 giây

                // Kết nối và xác thực
                await smtp.ConnectAsync(_smtpSettings.SmtpServer, _smtpSettings.SmtpPort, SecureSocketOptions.StartTls);
                await smtp.AuthenticateAsync(_smtpSettings.SmtpUser, _smtpSettings.SmtpPass);

                // Gửi email
                await smtp.SendAsync(email);
                await smtp.DisconnectAsync(true);

                return true;
            }
            catch (SmtpCommandException ex)
            {
                // Log lỗi SMTP cụ thể
                Console.WriteLine($"SMTP Error sending email to {toEmail}: {ex.StatusCode} - {ex.Message}");
                return false;
            }
            catch (SmtpProtocolException ex)
            {
                // Log lỗi giao thức SMTP
                Console.WriteLine($"SMTP Protocol Error sending email to {toEmail}: {ex.Message}");
                return false;
            }
            catch (Exception ex)
            {
                // Log lỗi tổng quát
                Console.WriteLine($"Error sending email to {toEmail}: {ex.Message}");
                return false;
            }
        }

        private string ConvertHtmlToPlainText(string html)
        {
            // Đơn giản: xóa các thẻ HTML và giữ lại nội dung
            // Có thể sử dụng thư viện chuyên dụng như HtmlAgilityPack cho phiên bản tốt hơn
            return System.Text.RegularExpressions.Regex.Replace(html, "<[^>]*>", "");
        }

    }
}
