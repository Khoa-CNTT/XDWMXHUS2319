import React from "react";
import "../../styles/MessageView/MessageInput.scss";

const MessageInput = () => {
  return (
    <div className="message-input">
      <button className="message-input__icon">📎</button>
      <button className="message-input__icon">📷</button>
      <input type="text" placeholder="Nhập vào tin nhắn" />
      <button className="message-input__send">👍</button>
    </div>
  );
};

export default MessageInput;
