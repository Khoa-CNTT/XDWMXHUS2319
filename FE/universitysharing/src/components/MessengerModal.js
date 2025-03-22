import React, { useEffect, useRef } from "react";
import "../styles/MessengerModal.scss";

const MessengerModal = ({ isOpen, onClose, messages }) => {
  const modalRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        onClose(); // Đóng modal khi click ra ngoài
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
    <div className="messenger-modal" ref={modalRef}>
      <div className="modal-header">
        <h2>Tin nhắn</h2>
      </div>
      <div className="modal-body">
        {messages.length > 0 ? (
          messages.map((msg, index) => (
            <div key={index} className="message-item">
              <img src={msg.avatar} alt="avatar" className="avatar" />
              <div className="message-content">
                <strong>{msg.name}</strong>
                <p>{msg.text}</p>
              </div>
            </div>
          ))
        ) : (
          <p>Không có tin nhắn nào</p>
        )}
      </div>
    </div>
  );
};

export default MessengerModal;
