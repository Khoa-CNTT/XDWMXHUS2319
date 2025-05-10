using Application.DTOs.Shares;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.CQRS.Commands.Shares
{
    public class SharePostCommand : IRequest<ResponseModel<ResultSharePostDto>>
    {
        public Guid PostId { get; set; }
        public string? Content { get; set; }
        public string? redis_key { get; set; } = string.Empty;
    }
}
