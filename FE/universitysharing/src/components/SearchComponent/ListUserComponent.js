import React from "react";
import "../../styles/SearchView/ListUser.scss";
import avatarweb from "../../assets/AvatarDefault.png";
import { useDispatch } from "react-redux";
import { fetchUserProfile } from "../../stores/action/searchAction";
import { useNavigate } from "react-router-dom";
import getUserIdFromToken from "../../utils/JwtDecode";

const ListUser = ({ users = [] }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  if (users.length === 0) return null;

  const handleUserClick = (userId) => {
    if (userId === getUserIdFromToken()) {
      navigate("/ProfileUserView");
    } else {
      navigate(`/profile/${userId}`);
    }
  };
  return (
    <div className="suggested-user-container">
      <h3 className="suggested-user-title">Mọi người</h3>
      <div className="suggested-user-list">
        {users.map((user) => (
          <div
            key={user.data.id}
            className="user-item"
            onClick={() => handleUserClick(user.data.id)}
          >
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
