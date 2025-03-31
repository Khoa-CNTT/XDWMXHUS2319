using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Model.Events
{
    public class SendInAppNotificationEvent : INotification
    {
        public Guid userId { get; set; }
        public string message { get; set; }
        public SendInAppNotificationEvent(Guid userId,string message)
        {
            this.userId = userId;
            this.message = message;
        }
    }
}
