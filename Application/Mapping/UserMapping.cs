using Application.DTOs.User;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Mapping
{
    public static class UserMapping
    {
        public static UserDto MapToUserDto(this User user)
        {
            if (user == null) return null;

            return new UserDto
            {
                Id = user.Id,
                FullName = user.FullName,
                ProfilePicture = user.ProfilePicture
            };
        }
    }
}
