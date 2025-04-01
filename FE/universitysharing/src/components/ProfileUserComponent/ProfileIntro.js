import React from "react";
import "../../styles/ProfileUserView/ProfileIntro.scss";

const ProfileIntro = ({ usersProfile }) => {
  return (
    <div className="profile-intro">
      <div className="profile-intro__header">
        <h2>Giới Thiệu</h2>
        <a href="#" className="profile-intro__view-all">
          Chỉnh sửa thông tin
        </a>
      </div>
      <p>{usersProfile?.bio || "Chưa có thông tin giới thiệu."}</p>
    </div>
  );
};

export default ProfileIntro;
