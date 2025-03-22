import React from "react";
import "../../styles/headerHome.scss";
import notify from "../../assets/iconweb/notificationsIcon.svg";
import messenger from "../../assets/iconweb/MessIcon.png";
import homeIcon from "../../assets/iconweb/homeIcon.svg";
import friendIcon from "../../assets/iconweb/friendICon.svg";
import sharebikeIcon from "../../assets/iconweb/sharMotoIcon.svg";
const LeftSidebar = () => {
  return (
    <aside className="left-sidebar">
      <ul>
        <li>
          <img src={homeIcon}></img>
          <span>Trang chủ</span>
        </li>
        <li>
          <img src={friendIcon}></img>
          <span>Bạn bè</span>
        </li>
        <li>
          <img src={messenger}></img>
          <span>Nhắn tin</span>
        </li>
        <li>
          <img src={notify}></img>
          <span>Thông báo</span>
        </li>
        <li>
          <img src={sharebikeIcon}></img>
          <span>Chia sẻ xe</span>
        </li>
      </ul>
    </aside>
  );
};

export default LeftSidebar;
