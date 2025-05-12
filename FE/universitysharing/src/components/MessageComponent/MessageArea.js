import React, { useRef, useEffect } from "react";
import "../../styles/MessageView/MessageArea.scss";
import avatartDefault from "../../assets/AvatarDefaultFill.png";
import getUserIdFromToken from "../../utils/JwtDecode";
import { useSelector } from "react-redux";
import { useTypingReceiver } from "../../utils/MesengerHandle";
const MessageArea = ({
  conversationId,
  messagers,
  refScroll,
  topRef,
  scrollContainerRef,
  avatar,
  selectedFriend,
}) => {
  useTypingReceiver(selectedFriend?.friendId, conversationId);
  const currentUserID = getUserIdFromToken(); // Lấy ID người dùng hiện tại
  const reversedMessages = [...messagers].reverse();
  // Lấy trạng thái typing từ Redux
  const typingUserId = useSelector((state) => state.typing[conversationId]);
  const isSelfTyping = typingUserId === currentUserID; // Gõ từ mình
  const isFriendTyping = typingUserId === selectedFriend?.friendId; // Gõ từ bạn bè

  console.warn("ID bản thân ", isSelfTyping);
  console.warn("ID typingUserId ", typingUserId);
  console.warn("ID typingUserId ", typingUserId);

  return (
    <>
      <div className="message-area" ref={scrollContainerRef}>
        {/* Hiển thị typing */}
        {/* {(isSelfTyping || isFriendTyping) && (
          <div
            className={`message-area__item ${isSelfTyping ? "self" : "other"}`}
          >
            
            {!isSelfTyping && (
              <div className="message-area__avatar">
                <img
                  src={selectedFriend?.pictureProfile || avatartDefault}
                  alt="Avatar"
                />
              </div>
            )}
            <div
              className={`message-area__message typing-indicator ${
                isSelfTyping ? "self" : "other"
              }`}
            >
              Đang nhập...
            </div>
          </div>
        )} */}

        {(isSelfTyping || isFriendTyping) && (
          <div
            className={`message-area__item ${isSelfTyping ? "self" : "other"}`}
          >
            {!isSelfTyping && (
              <div className="message-area__avatar">
                <img
                  src={selectedFriend?.pictureProfile || avatartDefault}
                  alt="Avatar"
                />
              </div>
            )}
            <div
              className={`message-area__message typing-indicator ${
                isSelfTyping ? "self" : "other"
              }`}
            >
              <span className="dot"></span>
              <span className="dot"></span>
              <span className="dot"></span>
            </div>
          </div>
        )}

        {/* Hiện thị tin nhắn  */}
        {reversedMessages.map((message, index) => {
          const isSelf = message.senderId === currentUserID;

          return (
            <div
              key={index}
              className={`message-area__item ${isSelf ? "self" : "other"}`}
            >
              {!isSelf && (
                <div className="message-area__avatar">
                  <img
                    src={selectedFriend?.pictureProfile || avatartDefault}
                    alt="Avatar"
                  />
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
