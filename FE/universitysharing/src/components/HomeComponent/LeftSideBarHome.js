import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { motion } from "framer-motion";
import {
  FiHome,
  FiUser,
  FiMessageSquare,
  FiBell,
  FiMapPin,
  FiChevronRight,
} from "react-icons/fi";
import { RiUserLocationLine } from "react-icons/ri";

const LeftSidebar = ({ usersProfile }) => {
  // console.log("Hello>>", usersProfile);
  const navigate = useNavigate();
  const location = useLocation();

  let username = usersProfile.fullName || "Người dùng";

  // Menu items data

  const menuItems = [
    { path: "/home", icon: <FiHome />, label: "Trang chủ" },
    { path: "/friends", icon: <FiUser />, label: "Bạn bè" },
    { path: "/messenger", icon: <FiMessageSquare />, label: "Nhắn tin" },
    { path: "/notifications", icon: <FiBell />, label: "Thông báo" },
    { path: "/sharing-ride", icon: <FiMapPin />, label: "Chia sẻ xe" },
    {
      path: "/your-ride",
      icon: <RiUserLocationLine />,
      label: "Chuyến đi của bạn",
    },
  ];

  return (
    <aside className="left-sidebar">
      <motion.div
        onClick={() => navigate("/ProfileUserView")}
        className="user-profile-navigate"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        transition={{ type: "spring", stiffness: 400, damping: 17 }}
      >
        <img
          src={usersProfile.profilePicture}
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

// import React from "react";
// import { useNavigate, useLocation } from "react-router-dom";
// import { jwtDecode } from "jwt-decode";
// import { motion } from "framer-motion";
// import {
//   FiHome,
//   FiUser,
//   FiMessageSquare,
//   FiBell,
//   FiMapPin,
//   FiChevronRight,
// } from "react-icons/fi";
// import { RiUserLocationLine } from "react-icons/ri";

// const LeftSidebar = () => {
//   const navigate = useNavigate();
//   const location = useLocation();

//   // Get username from JWT
//   let username = "Người dùng";
//   const token = localStorage.getItem("token");
//   if (token) {
//     try {
//       const decoded = jwtDecode(token);
//       username =
//         decoded["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"] ||
//         "Người dùng";
//     } catch (err) {
//       console.error("Lỗi khi decode token:", err);
//     }
//   }

//   // Menu items data
//   const menuItems = [
//     { path: "/ProfileUserView", icon: <FiHome />, label: username }, // ✅ sửa dòng này
//     { path: "/home", icon: <FiHome />, label: "Trang chủ" },
//     { path: "/friends", icon: <FiUser />, label: "Bạn bè" },
//     { path: "/messenger", icon: <FiMessageSquare />, label: "Nhắn tin" },
//     { path: "/notifications", icon: <FiBell />, label: "Thông báo" },
//     { path: "/sharing-ride", icon: <FiMapPin />, label: "Chia sẻ xe" },
//     {
//       path: "/your-ride",
//       icon: <RiUserLocationLine />,
//       label: "Chuyến đi của bạn",
//     },
//   ];

//   return (
//     <aside className="left-sidebar">
//       <ul>
//         {menuItems.map((item) => (
//           <motion.li
//             key={item.path}
//             className={location.pathname === item.path ? "active" : ""}
//             onClick={() => navigate(item.path)}
//             whileHover={{ scale: 1.02 }}
//             whileTap={{ scale: 0.98 }}
//             transition={{ type: "spring", stiffness: 400, damping: 17 }}
//           >
//             <div className="menu-item-content">
//               <span className="sidebar-icon">{item.icon}</span>
//               <span className="menu-label">{item.label}</span>
//             </div>
//             {location.pathname === item.path && (
//               <motion.div
//                 className="active-indicator"
//                 layoutId="activeIndicator"
//                 transition={{ type: "spring", stiffness: 500, damping: 30 }}
//               />
//             )}
//             <FiChevronRight className="chevron-icon" />
//           </motion.li>
//         ))}
//       </ul>
//     </aside>
//   );
// };

// export default LeftSidebar;
