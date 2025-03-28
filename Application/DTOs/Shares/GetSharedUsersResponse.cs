using Application.DTOs.User;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.DTOs.Shares
{
    public class GetSharedUsersResponse
    {
        public List<GetUserShareDto> Users { get; set; } = new();
        public Guid? NextCursor { get; set; } // ID của người chia sẻ cuối cùng
    }
}
