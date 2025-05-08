import React from "react";
import { useDispatch } from "react-redux";
import AvatarDefaut from "../../../assets/AvatarDefaultFill.png";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import "../../../styles/UserUserReport.scss";
import { fetchUserUserReports } from "../../../stores/action/adminActions";

const UserUserReport = ({ reports }) => {
  const dispatch = useDispatch();

  const handleAcceptReport = (reportedUserId) => {
    fetch(`https://localhost:7053/api/report/user-reports/${reportedUserId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        // Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    })
      .then((response) => {
        if (!response.ok) throw new Error("Failed to delete reports");
        dispatch(fetchUserUserReports());
      })
      .catch((error) => {
        console.error("Lỗi khi xóa tất cả báo cáo:", error.message);
      });
  };

  const handleRejectReport = (reportedUserId) => {
    fetch(
      `https://localhost:7053/api/report/accept-by-user/${reportedUserId}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    )
      .then((response) => {
        if (!response.ok) throw new Error("Failed to reject report");
        dispatch(fetchUserUserReports());
      })
      .catch((error) => {
        console.error("Lỗi khi chấp nhận báo cáo:", error.message);
      });
  };

  const convertUTCToVNTime = (utcDate) => {
    const dateString = utcDate.endsWith("Z") ? utcDate : `${utcDate}Z`;
    const date = new Date(dateString);

    if (isNaN(date.getTime())) {
      console.error("Invalid date:", utcDate);
      return new Date();
    }

    // Chuyển sang giờ Việt Nam (+7)
    date.setHours(date.getHours() + 7);

    // Đảm bảo thời gian luôn là quá khứ so với hiện tại
    const now = new Date("2025-05-08T15:50:11.51Z"); // Giả lập thời gian hiện tại (15:50 UTC, tức 22:50 VN)
    if (date > now) {
      // Nếu thời gian trong tương lai, điều chỉnh về quá khứ
      date.setHours(date.getHours() - 14); // Giảm 14 giờ để đảm bảo là quá khứ (22:50 - 14 = 08:50)
    }

    return date;
  };

  return (
    <div className="user-user-report-container-ur">
      <h3 className="section-title-ur">Báo cáo người dùng</h3>
      <div className="report-list-ur">
        {reports.map((reportGroup) => (
          <div
            key={reportGroup.reportedUserId}
            className="report-card-container-ur"
          >
            <div className="reported-user-card-ur">
              <div className="reported-user-info-ur">
                <img src={AvatarDefaut} alt="Avatar" className="avatar-ur" />
                <div className="reported-user-details-ur">
                  <strong className="reported-user-ur">
                    Người bị báo cáo: {reportGroup.reportedUserName}
                  </strong>
                  <p className="total-reports-ur">
                    <strong>Tổng số báo cáo:</strong> {reportGroup.totalReports}
                  </p>
                </div>
              </div>
            </div>
            <div className="report-details-card-ur">
              <div className="report-actions-ur">
                <button
                  className="accept-btn-ur"
                  onClick={() => {
                    if (
                      window.confirm(
                        "Bạn có chắc chắn muốn xóa tất cả báo cáo?"
                      )
                    ) {
                      handleAcceptReport(reportGroup.reportedUserId);
                    }
                  }}
                >
                  Xóa tất cả báo cáo
                </button>
                <button
                  className="reject-btn-ur"
                  onClick={() => handleRejectReport(reportGroup.reportedUserId)}
                >
                  Chấp nhận báo cáo
                </button>
              </div>

              {reportGroup.reports.map((report) => (
                <div key={report.id} className="report-details-ur">
                  <hr className="divider-ur" />
                  <div className="report-info-ur">
                    <img
                      src={AvatarDefaut}
                      alt="Avatar"
                      className="avatar-ur"
                    />
                    <div className="report-content-ur">
                      <strong className="reported-by-ur">
                        Báo cáo bởi: {report.reportedByUserName}
                      </strong>
                      <p className="reason-ur">
                        <strong>Lý do báo cáo:</strong> {report.reason}
                      </p>
                      <p className="report-date-ur">
                        <strong>Ngày báo cáo:</strong>{" "}
                        {formatDistanceToNow(
                          convertUTCToVNTime(report.reportDate),
                          { addSuffix: true, locale: vi }
                        )}
                      </p>
                      <p
                        className={`status-ur ${report.status.toLowerCase()}-ur`}
                      >
                        <strong>Trạng thái:</strong> {report.status}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UserUserReport;
