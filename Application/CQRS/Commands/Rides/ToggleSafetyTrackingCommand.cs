using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.CQRS.Commands.Rides
{
    public class ToggleSafetyTrackingCommand : IRequest<ResponseModel<bool>>
    {
        public bool IsSafetyTrackingEnabled { get; set; }
        public ToggleSafetyTrackingCommand(bool isSafetyTrackingEnabled)
        {
            IsSafetyTrackingEnabled = isSafetyTrackingEnabled;
        }
    }
}
