import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchListFriend } from "../../stores/action/friendAction";
import "../../styles/ProfileUserView/ProfileFriends.scss";
import avatarDefaut from "../../assets/AvatarDefaultFill.png";
import { useNavigate } from "react-router-dom";

const ProfileFriends = ({ usersProfile }) => {
  const dispatch = useDispatch();
  const friendsData = useSelector((state) => state.friends.listFriends);
  const navigate = useNavigate();
  const handleFriendView = () => {
    navigate("/friend");
  };

  useEffect(() => {
    dispatch(fetchListFriend());
  }, [dispatch]);

  return (
    <div className="profile-friends">
      <div className="profile-friends__header">
        <h2>Bạn bè</h2>
        <a
          href="#"
          className="profile-friends__view-all"
          onClick={handleFriendView}
        >
          Xem tất cả
        </a>
      </div>
      <div className="profile-friends__list">
        {friendsData?.friends?.slice(0, 6).map(
          (
            friend,
            index // Hiển thị tối đa 6 bạn bè
          ) => (
            <div key={index} className="profile-friends__item">
              <img
                src={friend.pictureProfile || avatarDefaut}
                alt={friend.fullName}
                className="profile-friends__avatar"
              />
              <span className="profile-friends__name">{friend.fullName}</span>
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default ProfileFriends;
