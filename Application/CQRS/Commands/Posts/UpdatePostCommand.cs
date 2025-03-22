using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using static Domain.Common.Enums;

namespace Application.CQRS.Commands.Posts
{
    public class UpdatePostCommand : IRequest<ResponseModel<bool>>
    {
        public Guid PostId { get; set; }
        public string? Content { get; set; }
        public string? ImageUrl { get; set; }
        public string? VideoUrl { get; set; }
        public ScopeEnum? Scope { get; set; }

    }
}
