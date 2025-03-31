using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Domain.Common
{
    public class Enums
    {
        public enum PostTypeEnum
        {
            Moving, StudyMaterial, Exchange, StudyGroup, Discussion
        }
        public enum ApprovalStatusEnum
        {
            Pending, Approved, Rejected
        }
        public enum ScopeEnum
        {
            Public, Private, FriendsOnly
        }
        public enum FriendshipStatusEnum
        {
            Pending,   // Đang chờ xác nhận
            Accepted,  // Đã kết bạn
            Rejected,  // Đã từ chối
            Removed    // Đã hủy kết bạn
        }
        public enum GroupPrivacyEnum
        {
            Public,    // Mọi người có thể tham gia
            Private,   // Cần được phê duyệt để tham gia
            Secret     // Chỉ thành viên mới biết nhóm tồn tại
        }
        public enum GroupMemberRoleEnum
        {
            Member,   // Thành viên thường
            Moderator, // Quản trị viên nhóm
            Admin      // Chủ nhóm
        }
        public enum ReportStatusEnum
        {
            Pending,
            Reviewed,
            Rejected
        }
        public enum RoleEnum
        {
            User,
            Admin
        }
        public enum StatusRideEnum
        {
            Pending,
            Accepted,
            Rejected,
            Completed
        }
        public enum PostRideTypeEnum
        {
            OfferRide,//tài xế đăng
            RequestRide//hành khách đăng
        }
        public enum RidePostStatusEnum
        {
            open,//đang mở
            Matched,//đã tìm được người đi chung
            Canceled,//bị hủy
        }
        public enum AlertTypeEnums
        {
            DriverGPSOff,
            TripDelayed,
            NoResponse
        }
        public enum RatingLevelEnum
        {
            Poor,
            Average,
            Good,
            Excellent
        }
    }
}
