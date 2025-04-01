import React from "react";
import "../../styles/headerHome.scss";
import avatarDefaut from "../../assets/AvatarDefault.png";

const RightSidebar = () => {
  return (
    <aside className="right-sidebar">
      <h3>Bạn Bè</h3>
      <ul>
        <li>
          <img src={avatarDefaut}></img>
          <span>Thanh Le</span>
        </li>
        <li>
          <img src={avatarDefaut}></img>
          <span>Giàng A Lôi</span>
        </li>
        <li>
          <img src={avatarDefaut}></img>
          <span>Tuấn Đàm</span>
        </li>
        <li>
          <img src={avatarDefaut}></img>
          <span>Ngô Nhật Hi</span>
        </li>
      </ul>
    </aside>
  );
};

export default RightSidebar;
