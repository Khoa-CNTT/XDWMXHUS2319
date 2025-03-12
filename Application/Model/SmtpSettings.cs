using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Model
{
    public class SmtpSettings
    {

            public string SmtpServer { get; set; } = string.Empty;
            public int SmtpPort { get; set; }
            public string SmtpUser { get; set; } = string.Empty;
            public string SmtpPass { get; set; } = string.Empty;
            public string FromEmail { get; set; } = string.Empty;
            public string FromName { get; set; } = string.Empty;


    }

}
