import { FiArrowLeft } from "react-icons/fi";
import "../../styles/MessageView/RightSidebar.scss";
import ViewInfoFriend from "./ViewInfoFriend";
const RightSidebar = ({
  isOpen,
  toggleSidebar,
  selectedFriend,
  navigateUser,
}) => {
  return (
    <div className={`right-sidebar-message ${isOpen ? "open" : "closed"}`}>
      <div className="return-chat" onClick={toggleSidebar}>
        <FiArrowLeft />
      </div>
      <div className="right-sidebar-users">
        <ViewInfoFriend
          selectedFriend={selectedFriend}
          navigateUser={navigateUser}
        ></ViewInfoFriend>
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
