import React from "react";
import "../../styles/FriendView/FriendRequestItem.scss";
import avatarDefault from "../../assets/AvatarDefault.png";

const FriendRequestItem = ({ request }) => {
  const handleAccept = () => {
    console.log(`Đã xác nhận lời mời từ ${request.name}`);
    // Thêm logic xác nhận lời mời (gọi API, v.v.)
  };

  const handleDecline = () => {
    console.log(`Đã hủy lời mời từ ${request.name}`);
    // Thêm logic xóa lời mời (gọi API, v.v.)
  };

  return (
    <div className="friend-request-received-item">
      <img
        src={request.avatar || avatarDefault}
        alt={request.name}
        className="friend-request-received-avatar"
      />
      <p className="friend-request-received-name">{request.name}</p>
      <div className="friend-request-received-actions">
        <button
          className="accept-request-received-button"
          onClick={handleAccept}
        >
          Xác nhận
        </button>
        <button
          className="decline-request-received-button"
          onClick={handleDecline}
        >
          Hủy
        </button>
      </div>
    </div>
  );
};

export default FriendRequestItem;
