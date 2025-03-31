using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Model.Events
{
    public class SearchAIEvent : INotification
    {
        public Guid UserId { get; set; }
        public string MessageUser { get; set; }
        public string MessageAI { get; set; }
        public SearchAIEvent(Guid userId, string messageUser, string messageAI)
        {
            UserId = userId;
            MessageUser = messageUser;
            MessageAI = messageAI;
        }
    }
}
