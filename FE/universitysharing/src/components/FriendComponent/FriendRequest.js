import React from "react";
import "../../styles/FriendViews/FriendViewComponent.scss";
import AvatarDefaut from "../../assets/AvatarDefaultFill.png";

const FriendRequests = () => {
  const friendRequests = [
    { name: "Nguyễn  Thị Mộng Lý", status: "pending", avtart: AvatarDefaut },
    { name: "Hằng Rau Củ", status: "pending", avtart: AvatarDefaut },
    { name: "Trịnh Trần Ba Con", status: "pending", avtart: AvatarDefaut },
    { name: "Quang Linh VLog", status: "pending", avtart: AvatarDefaut },
    { name: "Quang Linh VLog", status: "pending", avtart: AvatarDefaut },
  ];

  return (
    <div className="friend-request-container">
      <h3 className="friend-request-title">Lời mời kết bạn</h3>

      <div className="friend-request-grid">
        {friendRequests.map((request, index) => (
          <div key={index} className="friend-request-card">
            <div className="friend-info">
              <div className="Avatar-Friend">
                <img src={request.avtart}></img>
              </div>
              <label htmlFor={`friend-${index}`}>{request.name}</label>
            </div>
            <div className="friend-actions">
              <button className="confirm-btn">Xác nhận</button>
              <button className="delete-btn">Xóa</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
export default FriendRequests;
