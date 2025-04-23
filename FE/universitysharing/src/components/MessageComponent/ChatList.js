import React from "react";
import "../../styles/MessageView/ChatList.scss";
import avatartDefault from "../../assets/AvatarDefaultFill.png";
import { FiSearch } from "react-icons/fi";
const ChatList = () => {
  const chats = [
    { name: "Nguyễn Trung Đăng", avatar: avatartDefault },
    { name: "Giang A Giot", avatar: avatartDefault },
    { name: "Đỗ Xuân Tứ", avatar: avatartDefault },
    { name: "Ngố Nhứt Hí", avatar: avatartDefault },
    { name: "Nguyen Thanh Che", avatar: avatartDefault },
  ];

  return (
    <div className="chat-list">
      <div className="chat-list__header">
        <h2>Tin nhắn</h2>
        <div className="chat-list__search">
          <input type="text" placeholder="Tìm kiếm bạn bè" />
          <div className="icon-search">
            <FiSearch className="search-icon" />
          </div>
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
