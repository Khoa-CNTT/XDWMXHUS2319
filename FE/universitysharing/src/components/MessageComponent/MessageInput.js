import React, { useState } from "react";
import "../../styles/MessageView/MessageInput.scss";
import { FiPaperclip, FiCamera, FiThumbsUp, FiSend } from "react-icons/fi";
import { RiThumbUpFill } from "react-icons/ri";

const MessageInput = ({
  message,
  setMessage,
  onSendMessage,
  isSending,
  isUserTyping,
  setIsUserTyping,
}) => {
  const handleInputChange = (e) => {
    setMessage(e.target.value);
    setIsUserTyping(true);
  };

  const handleSendClick = () => {
    if (!message.trim() || isSending) return;
    onSendMessage(); // gọi hàm từ cha
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendClick();
    }
  };

  return (
    <div
      className={`message-input ${message ? "message-input--expanded" : ""}`}
    >
      <button className="message-input__icon">
        <FiPaperclip className="message-input__icon-clip" />
      </button>
      <button className="message-input__icon">
        <FiCamera className="message-input__icon-camera" />
      </button>
      <input
        type="text"
        placeholder="Nhập vào tin nhắn"
        value={message}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        className="message-input__field"
        disabled={isSending}
      />
      <button className="message-input__send" onClick={handleSendClick}>
        {message ? (
          <FiSend className="message-input__icon-send" />
        ) : (
          <FiThumbsUp className="message-input__icon-send" />
        )}
      </button>
    </div>
  );
};

export default MessageInput;
