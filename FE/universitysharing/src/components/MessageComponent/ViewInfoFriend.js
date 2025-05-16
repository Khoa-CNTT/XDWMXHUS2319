import React from "react";
import Avtardeafaut from "../../assets/AvatarDefaultFill.png";
import "../../styles/MessageView/RìghtUserInfor.scss";

const ViewInfoFriend = ({ selectedFriend, navigateUser }) => {
  return (
    <>
      <div className="right-user-container">
        <img
          className="avatar-user-right"
          src={selectedFriend?.pictureProfile || Avtardeafaut}
        ></img>
        <strong>{selectedFriend?.fullName}</strong>
        <div className="users-right-actions">
          <button
            className="page-User"
            onClick={() => navigateUser(selectedFriend?.friendId)}
          >
            Trang cá nhân
          </button>
          <button className="report-userss">Báo cáo người dùng </button>
        </div>
      </div>
    </>
  );
};
export default ViewInfoFriend;
