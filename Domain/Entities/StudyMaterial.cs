using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Domain.Entities
{
    public class StudyMaterial
    {
        public Guid Id { get; private set; }
        public Guid UserId { get; private set; }
        public string Title { get; private set; }
        public string FileUrl { get; private set; }
        public string? Subject { get; private set; }
        public DateTime CreatedAt { get; private set; }

        public StudyMaterial(Guid userId, string title, string fileUrl, string? subject = null)
        {
            if (userId == Guid.Empty) throw new ArgumentException("UserId cannot be empty.");
            if (string.IsNullOrWhiteSpace(title)) throw new ArgumentException("Title is required.");
            if (string.IsNullOrWhiteSpace(fileUrl)) throw new ArgumentException("File URL is required.");

            Id = Guid.NewGuid();
            UserId = userId;
            Title = title;
            FileUrl = fileUrl;
            Subject = subject;
            CreatedAt = DateTime.UtcNow;
        }

        /// <summary>
        /// Cập nhật thông tin tài liệu học tập.
        /// </summary>
        public void Update(string title, string fileUrl, string? subject = null)
        {
            if (string.IsNullOrWhiteSpace(title)) throw new ArgumentException("Title is required.");
            if (string.IsNullOrWhiteSpace(fileUrl)) throw new ArgumentException("File URL is required.");

            Title = title;
            FileUrl = fileUrl;
            Subject = subject;
        }
    }
}

