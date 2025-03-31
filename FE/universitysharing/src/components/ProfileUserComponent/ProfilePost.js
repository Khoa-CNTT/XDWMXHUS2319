import React from "react";
import "../../styles/ProfileUserView/ProfilePost.scss";

const ProfilePosts = () => {
  return (
    <div className="profile-posts">
      <div className="profile-posts__input">
        <img
          src="https://via.placeholder.com/40"
          alt="Avatar"
          className="profile-posts__avatar"
        />
        <input
          type="text"
          placeholder="Bạn đang nghĩ gì thế?"
          className="profile-posts__input-field"
        />
      </div>
      <div className="profile-posts__content">
        <h2>Bài Viết hiện thị ở đây</h2>
      </div>
    </div>
  );
};

export default ProfilePosts;
