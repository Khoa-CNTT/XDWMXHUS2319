import React from "react";
import { useDispatch } from "react-redux";
// Thay đổi: Import deletePost và rejectReport từ reportActions
import AvatarDefaut from "../../../assets/AvatarDefaultFill.png";
import "../../styles/ReportFromUserContainer.scss";
import {
  deletePost,
  deleteAllReports,
} from "../../../stores/action/adminActions";
const AllReportFromUser = ({ reports, postId }) => {
  const dispatch = useDispatch();
  // Xử lý xóa bài viết
  const handleDeletePost = () => {
    dispatch(deletePost(postId))
      .unwrap()
      .catch((error) => {
        console.error("Lỗi khi xóa bài viết:", error.message);
      });
  };

  // Xử lý xóa tất cả báo cáo
  const handleDeleteAllReport = () => {
    dispatch(deleteAllReports(postId))
      .unwrap()
      .catch((error) => {
        console.error("Lỗi khi xóa tất cả báo cáo:", error.message);
      });
  };
  return (
    <div className="report-user-site">
      <div className="accept-reject-btn">
        <button className="accept-report" onClick={handleDeletePost}>
          Xóa bài viết
        </button>
        <button className="reject-report" onClick={handleDeleteAllReport}>
          Xóa tất cả báo cáo
        </button>
      </div>
      <div className="report-container">
        {reports.map((report) => (
          <div key={report.id} className="report-card">
            {/* Thay đổi: Sử dụng profilePicture từ API, fallback về AvatarDefaut */}
            <img
              src={
                report.profilePicture
                  ? `https://localhost:7053${report.profilePicture}`
                  : AvatarDefaut
              }
              alt="anh dai dien"
              className="avatar"
            />
            <div className="name-reason">
              {/* Thay đổi: Hiển thị username từ API */}
              <strong className="name-user-report">
                {report.username || "Người dùng ẩn danh"}
              </strong>
              {/* Thay đổi: Hiển thị lý do báo cáo */}
              <p className="reason-report">
                <strong>Lý do báo cáo:</strong> {report.reason}
              </p>
              {/* Thay đổi: Hiển thị chi tiết vi phạm nếu có */}
              {report.violationDetails && (
                <p className="violation-details">
                  <strong>Chi tiết vi phạm:</strong> {report.violationDetails}
                </p>
              )}
              {/* Thay đổi: Hiển thị trạng thái xử lý */}
              <p className="processed-status">
                <strong>Được xử lý bởi:</strong>{" "}
                {report.processedByAdmin
                  ? "Admin"
                  : report.processedByAI
                  ? "AI"
                  : "Chưa xử lý"}
              </p>
              {/* Thay đổi: Hiển thị trạng thái báo cáo nếu có */}
              {report.status && (
                <p className={`status-report ${report.status.toLowerCase()}`}>
                  <strong>Trạng thái:</strong> {report.status}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AllReportFromUser;
