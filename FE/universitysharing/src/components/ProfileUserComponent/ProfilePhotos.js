import React from "react";
import "../../styles/ProfileUserView/ProfilePhotos.scss";

const ProfilePhotos = () => {
  return (
    <div className="profile-photos">
      <div className="profile-photos__header">
        <h2>Ảnh</h2>
        <a href="#" className="profile-photos__view-all">
          Xem tất cả
        </a>
      </div>
      <div className="profile-photos__grid">
        <div className="profile-photos__item" />
        <div className="profile-photos__item" />
        <div className="profile-photos__item" />
      </div>
    </div>
  );
};

export default ProfilePhotos;
