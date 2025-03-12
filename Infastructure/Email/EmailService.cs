using Application.Model;
using Microsoft.Extensions.Options;
using System.Net.Mail;
using MimeKit;
using MimeKit.Text;
using Application.Interface;
using MailKit.Security;
using MailKit.Net.Smtp;
using Application.Services;
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

    }
}
