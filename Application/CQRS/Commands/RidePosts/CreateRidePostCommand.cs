using Application.DTOs.RidePost;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using static Domain.Common.Enums;

namespace Application.CQRS.Commands.RidePosts
{
    public class CreateRidePostCommand : IRequest<ResponseModel<ResponseRidePostDto>>
    {
        public required string StartLocation { get; set; }
        public required string EndLocation { get; set; }
        public DateTime StartTime { get; set; }
        public PostRideTypeEnum PostType { get; set; }

        // tạo constructor
        public CreateRidePostCommand(string startLocation, string endLocation, DateTime startTime, PostRideTypeEnum postType)
        {
            StartLocation = startLocation;
            EndLocation = endLocation;
            StartTime = startTime;
            PostType = postType;
        }
        private CreateRidePostCommand() { }
    }
}
