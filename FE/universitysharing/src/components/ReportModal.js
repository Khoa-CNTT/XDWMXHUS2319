import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import "../styles/ReportModal.scss";

import { useDispatch, useSelector } from "react-redux";
import { reportPost } from "../stores/action/reportAction";
import { clearReportState } from "../stores/reducers/reportReducers";

const ReportModal = ({ postId, onClose }) => {
  const [reason, setReason] = useState("");
  const [localError, setLocalError] = useState("");

  const dispatch = useDispatch();

  const { loading, success, error } = useSelector((state) => state.report);

  const handleSubmit = () => {
    if (!reason.trim()) {
      setLocalError("Vui lòng nhập lý do báo cáo.");
      return;
    }
    dispatch(reportPost({ postId, reason }));
  };

  useEffect(() => {
    if (success) {
      alert("Báo cáo của bạn đã được gửi thành công.");
      dispatch(clearReportState());
      onClose(); // Đóng modal sau khi gửi thành công
    }
  }, [success, dispatch, onClose]);

  useEffect(() => {
    return () => {
      // Clear state khi unmount modal
      dispatch(clearReportState());
    };
  }, [dispatch]);

  return (
    <div className="report-modal-overlay" onClick={onClose}>
      <div className="report-modal" onClick={(e) => e.stopPropagation()}>
        <h2>Báo cáo bài viết</h2>
        <textarea
          className="report-reason"
          placeholder="Nhập lý do báo cáo bài viết này..."
          value={reason}
          onChange={(e) => {
            setReason(e.target.value);
            setLocalError("");
          }}
        />
        {localError && <p className="error-message">{localError}</p>}
        {error && <p className="error-message">{error.message}</p>}

        <div className="modal-actions">
          <button
            className="cancel-btn-report"
            onClick={onClose}
            disabled={loading}
          >
            Hủy
          </button>
          <button
            className="submit-btn-report"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? "Đang gửi..." : "Gửi báo cáo"}
          </button>
        </div>
      </div>
    </div>
  );
};

ReportModal.propTypes = {
  postId: PropTypes.string.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default ReportModal;
