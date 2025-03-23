using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Interface
{
    public interface IFileService
    {
        Task<string?> SaveFileAsync(IFormFile file, string folderName, bool isImage);
        bool IsImage(IFormFile file);
        bool IsVideo(IFormFile file);
    }
}
