import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import {
  FiHome,
  FiUser,
  FiMessageSquare,
  FiBell,
  FiMapPin,
  FiChevronRight,
} from "react-icons/fi";
import { RiAiGenerate2 } from "react-icons/ri";
import { RiUserLocationLine } from "react-icons/ri";
import avatartDefault from "../../assets/AvatarDefaultFill.png";

const LeftSidebar = ({ usersProfile }) => {
  // console.log("Hello>>", usersProfile);
  const navigate = useNavigate();
  const location = useLocation();

  let username = usersProfile.fullName || "Người dùng";

  // Menu items data

  const menuItems = [
    { path: "/home", icon: <FiHome />, label: "Trang chủ" },

    { path: "/friend", icon: <FiUser />, label: "Bạn bè" },
    { path: "/MessageView", icon: <FiMessageSquare />, label: "Nhắn tin" },
    
    { path: "/chatBoxAI", icon: <RiAiGenerate2 />, label: "Sharing AI" },

    //  { path: "/notifications", icon: <FiBell />, label: "Thông báo" },

    { path: "/notify", icon: <FiBell />, label: "Thông báo" },

    { path: "/sharing-ride", icon: <FiMapPin />, label: "Chia sẻ xe" },
    {
      path: "/your-ride",
      icon: <RiUserLocationLine />,
      label: "Chuyến đi của bạn",
    },
  ];

  return (
    <aside className="left-sidebar-menu">
      <motion.div
        onClick={() => navigate("/ProfileUserView")}
        className="user-profile-navigate"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        transition={{ type: "spring", stiffness: 400, damping: 17 }}
      >
        <img
          src={usersProfile.profilePicture || avatartDefault}
          alt="Profile"
          className="profile-icon"
        />
        <span className="User-Name">{username}</span>
      </motion.div>
      <ul>
        {menuItems.map((item) => (
          <motion.li
            key={item.path}
            className={location.pathname === item.path ? "active" : ""}
            onClick={() => navigate(item.path)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
          >
            <div className="menu-item-content">
              <span className="sidebar-icon">{item.icon}</span>
              <span className="menu-label">{item.label}</span>
            </div>
            {location.pathname === item.path && (
              <motion.div
                className="active-indicator"
                layoutId="activeIndicator"
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              />
            )}
            <FiChevronRight className="chevron-icon" />
          </motion.li>
        ))}
      </ul>
    </aside>
  );
};

export default LeftSidebar;
