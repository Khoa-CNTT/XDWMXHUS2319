import React, { useState, useRef, useCallback } from "react";
import "../../styles/MessageView/MessageInput.scss";
import { FiPaperclip, FiCamera, FiThumbsUp, FiSend } from "react-icons/fi";
import { RiThumbUpFill } from "react-icons/ri";
import getUserIdFromToken from "../../utils/JwtDecode";
import { useChatHandle } from "../../utils/MesengerHandle";
const TYPING_INTERVAL = 3000;
const MessageInput = ({
  conversationId,
  friendId,
  message,
  setMessage,
  onSendMessage,
  isSending,
  isUserTyping,
  setIsUserTyping,
}) => {
  const { handleTyping } = useChatHandle();
  const lastTypingTimeRef = useRef(0);
  const currentUserID = getUserIdFromToken(); // Lấy ID người dùng hiện tại
  const handleInputChange = useCallback(
    (e) => {
      const newMessage = e.target.value;
      setMessage(newMessage);
      handleTyping(e, {
        conversationId,
        friendId,
        currentUserID,
        setNewMessage: setMessage,
        setIsUserTyping,
        lastTypingTimeRef,
        TYPING_INTERVAL,
      });
      setIsUserTyping(true);
    },
    [
      conversationId,
      friendId,
      currentUserID,
      setMessage,
      setIsUserTyping,
      handleTyping,
    ]
  );

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
