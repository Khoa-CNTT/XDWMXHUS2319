import React from "react";
import "../../styles/ProfileUserView/ProfileFriends.scss";
import avatarDefaut from "../../assets/AvatarDefaultFill.png";

const ProfileFriends = () => {
  const friends = [
    { name: "Thanh Le", avatar: "https://via.placeholder.com/40" },
  ];

  return (
    <div className="profile-friends">
      <div className="profile-friends__header">
        <h2>Bạn bè</h2>
        <a href="#" className="profile-friends__view-all">
          Xem tất cả
        </a>
      </div>
      <div className="profile-friends__list">
        {friends.map((friend, index) => (
          <div key={index} className="profile-friends__item">
            <img
              src={avatarDefaut}
              alt={friend.name}
              className="profile-friends__avatar"
            />
            <span className="profile-friends__name">{friend.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProfileFriends;
