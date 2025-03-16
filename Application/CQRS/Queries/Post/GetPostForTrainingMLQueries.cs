using Application.DTOs.Post;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using static Domain.Common.Enums;

namespace Application.CQRS.Queries.Post
{
    public class GetPostForTrainingMLQueries : IRequest<ResponseModel<IEnumerable<GetPostForTrainingDto>>>
    {
        public required ApprovalStatusEnum ApprovalStatus { get; set; }

       
    }
}
