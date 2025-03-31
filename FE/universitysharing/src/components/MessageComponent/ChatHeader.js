import React from "react";
import "../../styles/MessageView/ChatHeader.scss";

const ChatHeader = () => {
  return (
    <div className="chat-header">
      <div className="chat-header__info">
        <img
          src="https://via.placeholder.com/40"
          alt="Avatar"
          className="chat-header__avatar"
        />
        <span className="chat-header__name">Nguyễn Trung Đăng</span>
      </div>
      <div className="chat-header__actions">
        <button className="chat-header__button">Trang cá nhân</button>
        <button className="chat-header__button report">Báo cáo làm dụng</button>
      </div>
    </div>
  );
};

export default ChatHeader;
