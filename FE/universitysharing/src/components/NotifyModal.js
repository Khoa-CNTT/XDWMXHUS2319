import React, { useEffect, useRef } from "react";
import "../styles/NotifyModal.scss";
import "../styles/MoblieReponsive/HomeViewMobile/NotifyMobile.scss";
const NotifyModal = ({ isOpen, onClose }) => {
  const modaldef = useRef(null);
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modaldef.current && !modaldef.current.contains(event.target)) {
        onClose(); //Đóng modal notify
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <>
      <div className="notify-modal-overlay"></div>
      <div className="notify-modal" ref={modaldef}>
        <div className="modal-header">
          <h2>Thông báo</h2>
        </div>
        <div className="modal-body">
          <p>Bạn có 1 thông báo mới</p>
        </div>
        <div className="modal-footer">
          <a href="#">Xem tất cả thông báo</a>
        </div>
      </div>
    </>
  );
};

export default NotifyModal;
