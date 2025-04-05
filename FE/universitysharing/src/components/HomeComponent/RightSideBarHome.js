import React, { useState } from "react";
import "../../styles/headerHome.scss";
import avatarDefaut from "../../assets/AvatarDefault.png";

const RightSidebar = () => {
  const [activeFriend, setActiveFriend] = useState(null); // Quản lý bạn bè được chọn

  const handleFriendClick = (friendName) => {
    setActiveFriend(friendName); // Đặt bạn bè được chọn làm active
  };

  return (
    <aside className="right-sidebar">
      <h3>Bạn Bè</h3>
      <ul>
        <li
          className={activeFriend === "Thanh Le" ? "active" : ""}
          onClick={() => handleFriendClick("Thanh Le")}
        >
          <img src={avatarDefaut} alt="Avatar" />
          <span>Thanh Le</span>
        </li>
        <li
          className={activeFriend === "Giàng A Lôi" ? "active" : ""}
          onClick={() => handleFriendClick("Giàng A Lôi")}
        >
          <img src={avatarDefaut} alt="Avatar" />
          <span>Giàng A Lôi</span>
        </li>
        <li
          className={activeFriend === "Tuấn Đàm" ? "active" : ""}
          onClick={() => handleFriendClick("Tuấn Đàm")}
        >
          <img src={avatarDefaut} alt="Avatar" />
          <span>Tuấn Đàm</span>
        </li>
        <li
          className={activeFriend === "Ngô Nhật Hi" ? "active" : ""}
          onClick={() => handleFriendClick("Ngô Nhật Hi")}
        >
          <img src={avatarDefaut} alt="Avatar" />
          <span>Ngô Nhật Hi</span>
        </li>
      </ul>
    </aside>
  );
};

export default RightSidebar;