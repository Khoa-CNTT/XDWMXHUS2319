using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.DTOs.Post
{
    public class AuthorDto
    {
        public string UserName { get; set; }
        public string? AvatarUrl { get; set; }

        public AuthorDto(Domain.Entities.User user)
        {
            UserName = user.FullName ?? "Người dùng ẩn danh";
            AvatarUrl = user.ProfilePicture;
        }
    }
}
