import React, { useState } from "react";
import { toast } from "react-toastify";
import "../../styles/ProfileUserView/UserReportUserModal.scss";

const UserReportUserModal = ({ isOpen, onClose, reportedUserId }) => {
  const [selectedReason, setSelectedReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const reportReasons = [
    "Người dùng giả mạo",
    "Hành vi xúc phạm",
    "Nội dung không phù hợp",
    "Spam",
    "Khác",
  ];

  const handleSubmitReport = async () => {
    if (!selectedReason) {
      toast.error("Vui lòng chọn lý do báo cáo");
      return;
    }

    if (!reportedUserId) {
      toast.error("ID người dùng báo cáo không hợp lệ");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch(
        "https://localhost:7053/api/UserProfile/user-report-user",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            // Thêm token nếu API yêu cầu (giả sử lấy từ localStorage hoặc context)
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({
            reportedUserId,
            reason: selectedReason,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.success) {
        toast.success("Báo cáo đã được gửi thành công");
        onClose();
      } else {
        toast.error(result.message || `Lỗi: ${JSON.stringify(result)}`);
      }
    } catch (error) {
      console.error("Error submitting report:", error);
      toast.error(`Đã có lỗi xảy ra khi gửi báo cáo: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="user-report-modal-backdrop">
      <div className="user-report-modal">
        <h2 className="user-report-modal__title">Báo cáo người dùng</h2>
        <div className="user-report-modal__form-group">
          <label>Lý do báo cáo</label>
          <select
            value={selectedReason}
            onChange={(e) => setSelectedReason(e.target.value)}
          >
            <option value="">Chọn lý do</option>
            {reportReasons.map((reason) => (
              <option key={reason} value={reason}>
                {reason}
              </option>
            ))}
          </select>
        </div>
        <div className="user-report-modal__actions">
          <button
            className="cancel-btn-user-report"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Hủy
          </button>
          <button
            className="submit-btn"
            onClick={handleSubmitReport}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Đang gửi..." : "Gửi báo cáo"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserReportUserModal;
