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
            Pending,  Approved, Rejected 
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
            Pending = 1,           // Chờ xử lý
            AI_Processed = 2,      // Đã xử lý bởi AI
            Admin_Approved = 3,    // Admin chấp nhận báo cáo
            Rejected = 4,    // Admin từ chối báo cáo
            Auto_Resolved = 5,      // Tự động xử lý (khi AI xử lý xong)
            Reviewed
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

        public enum ActionTakenEnum
        {
            None = 0,            // Chưa có hành động
            HidePost = 1,        // Ẩn bài đăng
            WarnUser = 2,        // Cảnh báo người dùng
            ReduceTrustScore = 3,// Giảm điểm uy tín
            BanUser = 4,         // Khóa tài khoản
            DeleteContent = 5    // Xóa nội dung
        }
        public enum ViolationTypeEnum
        {
            Spam = 1,               // Nội dung spam
            InappropriateContent = 2,// Nội dung không phù hợp
            HateSpeech = 3,          // Ngôn từ gây thù ghét
            CopyrightInfringement = 4,// Vi phạm bản quyền
            FakeInformation = 5,     // Thông tin giả mạo
            Other = 99               // Lý do khác
        }

        public enum MessageStatus
        {
            Sent,      // Đã gửi
            Delivered, // Đã nhận
            Seen       // Đã xem
        }
        public enum NotificationType
        {
            PostLiked,
            PostCommented,
            PostShared,
            NewMessage,
            NewFriendRequest,
            RideInvite,
            SystemAlert,
            SendFriend,
            AcceptFriend,
            ReplyComment,
            LikeComment,
        }

    }
}
