using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using static Domain.Common.Enums;

namespace Domain.Entities
{
    public class GroupMember
    {
        public Guid Id { get; private set; }
        public Guid GroupId { get; private set; }
        public Guid UserId { get; private set; }
        public DateTime JoinedAt { get; private set; }
        public GroupMemberRoleEnum Role { get; private set; }

        public GroupMember(Guid groupId, Guid userId, GroupMemberRoleEnum role = GroupMemberRoleEnum.Member)
        {
            if (groupId == Guid.Empty) throw new ArgumentException("GroupId cannot be empty.");
            if (userId == Guid.Empty) throw new ArgumentException("UserId cannot be empty.");

            Id = Guid.NewGuid();
            GroupId = groupId;
            UserId = userId;
            JoinedAt = DateTime.UtcNow;
            Role = role;
        }

        /// <summary>
        /// Cập nhật vai trò của thành viên trong nhóm
        /// </summary>
        public void UpdateRole(GroupMemberRoleEnum newRole)
        {
            Role = newRole;
        }
    }

    
}

