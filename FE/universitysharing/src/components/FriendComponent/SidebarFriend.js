import React from "react";
import "../../styles/FriendView/SidebarFriend.scss";
import {
  FaHome,
  FaUserFriends,
  FaLightbulb,
  FaUsers,
  FaBirthdayCake,
  FaList,
} from "react-icons/fa";

const Sidebar = ({ activeTab, setActiveTab }) => {
  const menuItems = [
    { name: "Tất cả bạn bè", icon: <FaUsers />, key: "all-friends" },
    {
      name: "Lời mời kết bạn",
      icon: <FaUserFriends />,
      key: "friend-requests",
    },
    { name: "Lời mời đi", icon: <FaUserFriends />, key: "friend-request-sent" },
    { name: "Gợi ý", icon: <FaLightbulb />, key: "suggestions" },
  ];

  return (
    <div className="sidebar">
      <h2 className="sidebar-title">Bạn bè</h2>
      <ul className="sidebar-menu">
        {menuItems.map((item) => (
          <li
            key={item.key}
            className={`sidebar-item ${activeTab === item.key ? "active" : ""}`}
            onClick={() => setActiveTab(item.key)}
          >
            <span className="sidebar-icon">{item.icon}</span>
            <span className="sidebar-text">{item.name}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Sidebar;
