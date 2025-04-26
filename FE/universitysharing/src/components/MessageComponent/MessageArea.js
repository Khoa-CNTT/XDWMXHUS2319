import React from "react";
import "../../styles/MessageView/MessageArea.scss";
import avatartDefault from "../../assets/AvatarDefaultFill.png";

const MessageArea = () => {
  const messages = [
    {
      avart: avatartDefault,
      text: "Xin chào bạn",
      sender: "other",
    },
    { text: "Chào bạn", sender: "self" },
    {
      avart: avatartDefault,
      text: "Xin chào bạn",
      sender: "other",
    },
  ];

  return (
    <div className="message-area">
      {messages.map((message, index) => (
        <div
          key={index}
          className={`message-area__item ${
            message.sender === "other" ? "other" : "self"
          }`}
        >
          {message.sender === "other" && (
            <div className="message-area__avatar">
              <img src={message.avart} alt="Avatar" />
            </div>
          )}
          <div
            className={`message-area__message ${
              message.sender === "other" ? "other" : "self"
            }`}
          >
            {message.text}
          </div>
        </div>
      ))}
    </div>
  );
};

export default MessageArea;
