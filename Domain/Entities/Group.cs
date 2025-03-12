using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using static Domain.Common.Enums;

namespace Domain.Entities
{
    public class Group
    {
        public Guid Id { get; private set; }
        public string Name { get; private set; }
        public Guid CreatedBy { get; private set; } // Không nên nullable
        public DateTime CreatedAt { get; private set; }
        public string? Description { get; private set; } // Mô tả nhóm
        public GroupPrivacyEnum Privacy { get; private set; } = GroupPrivacyEnum.Public; // Loại nhóm
        public virtual ICollection<GroupMember> GroupMembers { get; private set; } = new HashSet<GroupMember>(); // Danh sách thành viên

        public Group(Guid createdBy, string name, string? description = null, GroupPrivacyEnum privacy = GroupPrivacyEnum.Public)
        {
            if (createdBy == Guid.Empty) throw new ArgumentException("CreatedBy cannot be empty.");
            if (string.IsNullOrWhiteSpace(name)) throw new ArgumentException("Group name is required.");

            Id = Guid.NewGuid();
            Name = name;
            CreatedBy = createdBy;
            CreatedAt = DateTime.UtcNow;
            Description = description;
            Privacy = privacy;
        }

        /// <summary>
        /// Cập nhật thông tin nhóm
        /// </summary>
        public void UpdateInfo(string name, string? description, GroupPrivacyEnum privacy)
        {
            if (string.IsNullOrWhiteSpace(name)) throw new ArgumentException("Group name is required.");
            Name = name;
            Description = description;
            Privacy = privacy;
        }

    
    }

  
}

