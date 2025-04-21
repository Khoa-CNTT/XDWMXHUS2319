using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Interface.ChatAI
{
    public interface IChatStreamSender
    {
        Task SendStreamAsync(string sessionId, string data, bool isFinal);
    }
}
