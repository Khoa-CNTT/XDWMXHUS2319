import React from "react";
import "../../styles/SearchView/ListUser.scss";
import avatarweb from "../../assets/AvatarDefault.png";
const ListUser = ({ users = [] }) => {
  if (users.length === 0) return null;

  return (
    <div className="suggested-user-container">
      <h3 className="suggested-user-title">Mọi người</h3>
      <div className="suggested-user-list">
        {users.map((user) => (
          <div key={user.data.id} className="user-item">
            <img
              src={user.data.profilePicture || avatarweb}
              alt={user.data.fullName}
              className="user-avatar"
            />
            <div className="user-info">
              <h4 className="user-name">{user.data.fullName}</h4>
              <p className="user-bio">{user.data.bio || "No bio available"}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ListUser;
