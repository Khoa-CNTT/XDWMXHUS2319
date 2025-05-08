using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Hosting;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Services
{
    public class FileService : IFileService
    {
        private readonly string[] _allowedImageExtensions = { ".jpg", ".jpeg", ".png", ".gif", ".bmp" };
        private readonly string[] _allowedVideoExtensions = { ".mp4", ".mov", ".avi", ".wmv", ".flv", ".mkv" };
        private readonly string _webRootPath;
        public FileService(IHostEnvironment env)
        {
            _webRootPath = Path.Combine(env.ContentRootPath, "wwwroot");
        }
        public async Task<string?> SaveFileAsync(IFormFile file, string folderName, bool isImage)
        {
            if (file == null || file.Length == 0)
                return null;

            // Danh sách đuôi file hợp lệ
            var allowedImageExtensions = new[] { ".jpg", ".jpeg", ".png", ".gif" };
            var allowedVideoExtensions = new[] { ".mp4", ".avi", ".mov", ".mkv" };

            var fileExtension = Path.GetExtension(file.FileName).ToLower();

            if (isImage && !allowedImageExtensions.Contains(fileExtension))
                throw new InvalidOperationException("Invalid image format! Only JPG, PNG, GIF allowed.");

            if (!isImage && !allowedVideoExtensions.Contains(fileExtension))
                throw new InvalidOperationException("Invalid video format! Only MP4, AVI, MOV, MKV allowed.");

            var folderPath = Path.Combine(_webRootPath, folderName);
            if (!Directory.Exists(folderPath))
                Directory.CreateDirectory(folderPath);

            var fileName = $"{Guid.NewGuid()}{fileExtension}";
            var filePath = Path.Combine(folderPath, fileName);

            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }

            return $"/{folderName}/{fileName}"; // Trả về đường dẫn tương đối
        }
        public bool IsImage(IFormFile file)
        {
            var extension = Path.GetExtension(file.FileName).ToLower();
            return _allowedImageExtensions.Contains(extension);
        }

        public bool IsVideo(IFormFile file)
        {
            var extension = Path.GetExtension(file.FileName).ToLower();
            return _allowedVideoExtensions.Contains(extension);
        }
    }
}
