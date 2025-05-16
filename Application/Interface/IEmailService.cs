using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Interface
{
    public interface IEmailService
    {
        Task<bool> SendEmailAsync(string toEmail, string subject, string body);

        Task<bool> SendEmailHtmlAsync(string toEmail, string subject, string body, string? recipientName = null, string? replyTo = null);
    }
}
