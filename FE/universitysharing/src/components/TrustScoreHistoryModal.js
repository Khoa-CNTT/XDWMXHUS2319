import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiClock,
  FiAward,
  FiX,
  FiChevronUp,
  FiChevronDown,
} from "react-icons/fi";
import "../styles/TrustScoreHistoryModal.scss";

// Modal component to display credit history
const TrustScoreHistoryModal = ({ isOpen, onClose, creditHistory }) => {
  const [expandedRecord, setExpandedRecord] = React.useState(null);

  // Toggle expanded state for a record
  const toggleExpand = (index) => {
    setExpandedRecord(expandedRecord === index ? null : index);
  };

  // Format timestamp to a readable string
  const formatDateTime = (timestamp) => {
    return new Date(timestamp).toLocaleString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="modal-score-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          onClick={onClose}
        >
          <motion.div
            className="modal-score-content"
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 50, opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-score-header">
              <h3>
                <FiAward className="header-score-icon" /> Lịch sử điểm uy tín
              </h3>
              <button className="close-score-btn" onClick={onClose}>
                <FiX />
              </button>
            </div>
            <div className="modal-score-body">
              {creditHistory && creditHistory.length > 0 ? (
                <div className="credit-history-list">
                  {creditHistory.map((record, index) => (
                    <motion.div
                      key={index}
                      className={`history-record ${
                        expandedRecord === index ? "expanded" : ""
                      }`}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                    >
                      <div
                        className="record-score-summary"
                        onClick={() => toggleExpand(index)}
                      >
                        <div className="record-info">
                          <div className="record-date">
                            <FiClock className="record-icon" />
                            <span>{formatDateTime(record.timestamp)}</span>
                          </div>
                          <div className="record-change">
                            <span
                              className={`change-amount ${
                                record.change > 0 ? "positive" : "negative"
                              }`}
                            >
                              {record.change > 0
                                ? `+${record.change}`
                                : record.change}
                            </span>
                            <span className="change-label"> điểm</span>
                          </div>
                        </div>
                        <div className="expand-icon">
                          {expandedRecord === index ? (
                            <FiChevronUp />
                          ) : (
                            <FiChevronDown />
                          )}
                        </div>
                      </div>
                      {expandedRecord === index && (
                        <motion.div
                          className="record-details"
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          transition={{ duration: 0.3 }}
                        >
                          <div className="detail-item">
                            <label>Lý do:</label>
                            <span>{record.reason}</span>
                          </div>
                          <div className="detail-item">
                            <label>Điểm sau cập nhật:</label>
                            <span>{record.newCreditScore} điểm</span>
                          </div>
                        </motion.div>
                      )}
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="empty-state">
                  <FiAward className="empty-icon" />
                  <p>Chưa có lịch sử cập nhật điểm uy tín</p>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default TrustScoreHistoryModal;
