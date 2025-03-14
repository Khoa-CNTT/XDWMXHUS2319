using Application.DTOs.User;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.CQRS.Queries.User
{
    public class GetUsetByEmailQuery : IRequest<ResponseModel<UserResponseDto>>
    {
        public Guid Id { get; set; }
        public GetUsetByEmailQuery(Guid id)
        {
            Id = id;
        }
    }
}
