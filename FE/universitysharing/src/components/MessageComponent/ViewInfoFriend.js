import React from "react";
import Avtardeafaut from "../../assets/AvatarDefaultFill.png";
import "../../styles/MessageView/RìghtUserInfor.scss";

const ViewInfoFriend = () => {
  return (
    <>
      <div className="right-user-container">
        <img className="avatar-user-right" src={Avtardeafaut}></img>
        <strong>Nguyễn Thành Đảng</strong>
        <div className="users-right-actions">
          <button className="page-User">Trang cá nhân</button>
          <button className="report-userss">Báo cáo người dùng </button>
        </div>
      </div>
    </>
  );
};
export default ViewInfoFriend;
