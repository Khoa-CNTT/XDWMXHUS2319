using Application.DTOs.User;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.CQRS.Queries.User
{
    public class GetUsetByIdQuery : IRequest<ResponseModel<UserResponseDto>>
    {
        public Guid Id { get; set; }
        public GetUsetByIdQuery(Guid id)
        {
            Id = id;
        }
    }
}
