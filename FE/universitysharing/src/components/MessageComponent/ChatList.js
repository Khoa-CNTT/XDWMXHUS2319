import React from "react";
import "../../styles/MessageView/ChatList.scss";

const ChatList = () => {
  const chats = [
    { name: "Nguyễn Trung Đăng", avatar: "https://via.placeholder.com/40" },
    { name: "Giang A Giot", avatar: "https://via.placeholder.com/40" },
    { name: "Đỗ Xuân Tứ", avatar: "https://via.placeholder.com/40" },
    { name: "Ngố Nhứt Hí", avatar: "https://via.placeholder.com/40" },
    { name: "Nguyen Thanh Che", avatar: "https://via.placeholder.com/40" },
  ];

  return (
    <div className="chat-list">
      <div className="chat-list__header">
        <h2>Tin nhắn</h2>
        <div className="chat-list__search">
          <input type="text" placeholder="Tìm kiếm bạn bè" />
          <span className="search-icon">🔍</span>
        </div>
      </div>
      <div className="chat-list__items">
        {chats.map((chat, index) => (
          <div
            key={index}
            className={`chat-list__item ${index === 0 ? "active" : ""}`}
          >
            <img
              src={chat.avatar}
              alt={chat.name}
              className="chat-list__avatar"
            />
            <span className="chat-list__name">{chat.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ChatList;
