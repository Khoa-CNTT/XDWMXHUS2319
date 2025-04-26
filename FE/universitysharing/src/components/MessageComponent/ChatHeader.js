import React from "react";
import "../../styles/MessageView/ChatHeader.scss";
import avatartDefault from "../../assets/AvatarDefaultFill.png";
import { FiPhone, FiVideo, FiMoreHorizontal } from "react-icons/fi";

const ChatHeader = ({ toggleSidebar }) => {
  return (
    <div className="chat-header">
      <div className="chat-header__info">
        <img
          src={avatartDefault}
          alt="Avatar"
          className="chat-header__avatar"
        />
        <span className="chat-header__name">Nguyễn Trung Đăng</span>
      </div>
      <div className="chat-header__actions">
        <FiPhone className="chat-header__icon" />
        <FiVideo className="chat-header__icon" />
        <FiMoreHorizontal
          className="chat-header__icon"
          onClick={toggleSidebar}
          style={{ cursor: "pointer" }}
        />
      </div>
    </div>
  );
};

export default ChatHeader;
