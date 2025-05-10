import React from "react";
import "../../styles/MessageView/RightSidebar.scss";
import ViewInfoFriend from "./ViewInfoFriend";
import { FiArrowLeft } from "react-icons/fi";
const RightSidebar = ({ isOpen, toggleSidebar, selectedFriend }) => {
  return (
    <div className={`right-sidebar-message ${isOpen ? "open" : "closed"}`}>
      <div className="return-chat" onClick={toggleSidebar}>
        <FiArrowLeft />
      </div>
      <div className="right-sidebar-users">
        <ViewInfoFriend selectedFriend={selectedFriend}></ViewInfoFriend>
      </div>
      <div className="right-sidebar__section">
        <h3>Đa Phương Tiện</h3>
        {/* Placeholder for media content */}
      </div>
      <div className="right-sidebar__section">
        <h3>File</h3>
        {/* Placeholder for file content */}
      </div>
    </div>
  );
};

export default RightSidebar;
