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
          <span>Nguyễn Trung Đăng</span>
        </li>
        <li>
          <img src={avatarDefaut}></img>
          <span>Giàng A Giớt</span>
        </li>
        <li>
          <img src={avatarDefaut}></img>
          <span> Đôm Xum Tún</span>
        </li>
        <li>
          <img src={avatarDefaut}></img>
          <span> Ngô Nhật Hii</span>
        </li>
      </ul>
    </aside>
  );
};

export default RightSidebar;
