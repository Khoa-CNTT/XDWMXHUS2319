﻿using Application.DTOs.UpdateLocation;
using Application.Model;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.CQRS.Commands.UpdateLocation
{
    public class UpdateLocationCommand : IRequest<ResponseModel<UpdateLocationDto>>
    {
        public required Guid RideId { get; set; }
        public required float Latitude { get; set; }
        public required float Longitude { get; set; }
    }

}
