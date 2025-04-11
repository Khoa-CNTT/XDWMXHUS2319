﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.CQRS.Commands.Friends
{
    public class AcceptFriendRequestCommand :  IRequest<ResponseModel<bool>>
    {
        public Guid FriendshipId { get; set; }
    }
}
