import React, { useRef, useEffect } from "react";
import "../../styles/MessageView/MessageArea.scss";
import avatartDefault from "../../assets/AvatarDefaultFill.png";
import getUserIdFromToken from "../../utils/JwtDecode";

const MessageArea = ({
  messagers,
  refScroll,
  topRef,
  scrollContainerRef,
  avatar,
}) => {
  const currentUserID = getUserIdFromToken(); // Lấy ID người dùng hiện tại
  const reversedMessages = [...messagers].reverse();

  return (
    <>
      <div className="message-area" ref={scrollContainerRef}>
        {/* <div ref={topRef} style={{ height: "1px" }} /> */}
        {reversedMessages.map((message, index) => {
          const isSelf = message.senderId === currentUserID;

          return (
            <div
              key={index}
              className={`message-area__item ${isSelf ? "self" : "other"}`}
            >
              {!isSelf && (
                <div className="message-area__avatar">
                  <img src={avatar || avatartDefault} alt="Avatar" />
                </div>
              )}
              <div
                className={`message-area__message ${isSelf ? "self" : "other"}`}
              >
                {message.content}
              </div>
            </div>
          );
        })}
        <div ref={topRef} style={{ height: "1px" }} />
      </div>
    </>
  );
};

export default MessageArea;
