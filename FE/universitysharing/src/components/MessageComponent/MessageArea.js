import React from "react";
import "../../styles/MessageView/MessageArea.scss";

const MessageArea = () => {
  const messages = [{ text: "Xin chào bạn", sender: "other" }];

  return (
    <div className="message-area">
      {messages.map((message, index) => (
        <div
          key={index}
          className={`message-area__message ${
            message.sender === "other" ? "other" : "self"
          }`}
        >
          {message.text}
        </div>
      ))}
    </div>
  );
};

export default MessageArea;
