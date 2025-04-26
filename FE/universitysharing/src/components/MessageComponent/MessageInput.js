import React from "react";
import "../../styles/MessageView/MessageInput.scss";
import { FiPaperclip, FiCamera, FiThumbsUp } from "react-icons/fi";

const MessageInput = () => {
  return (
    <div className="message-input">
      <button className="message-input__icon">
        <FiPaperclip className="message-input__icon-clip" />
      </button>
      <button className="message-input__icon">
        <FiCamera className="message-input__icon-camera" />
      </button>
      <input type="text" placeholder="Nhập vào tin nhắn" />
      <button className="message-input__send">
        <FiThumbsUp className="message-input__icon-send" />
      </button>
    </div>
  );
};

export default MessageInput;
