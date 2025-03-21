﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Domain.Interface
{
     public interface IUserRepository : IBaseRepository<User>
    {
        
        Task<bool> GetExsitsEmailAsync(string email);
        Task<User?> GetUserByEmailAsync(string email);
        //tim kiem nguoi (dang)
        Task<User?> GetUserByIdAsync(Guid userId);
        Task<List<User>> SearchUsersAsync(string keyword);
        Task<string?> GetFullNameByIdAsync(Guid id);
    }
}
