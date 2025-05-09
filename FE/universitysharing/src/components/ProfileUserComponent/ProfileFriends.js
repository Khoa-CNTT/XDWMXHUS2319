import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchFriendPreview } from "../../stores/action/friendAction";
import "../../styles/ProfileUserView/ProfileFriends.scss";
import avatarDefaut from "../../assets/AvatarDefaultFill.png";
import { useNavigate } from "react-router-dom";
import getUserIdFromToken from "../../utils/JwtDecode";

const ProfileFriends = ({ usersProfile }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const friendsData = useSelector((state) => state.friends.listFriends);
  const loading = useSelector((state) => state.friends.loading);
  const error = useSelector((state) => state.friends.error);

  const navigateUser = (userId) => {
    if (userId === getUserIdFromToken()) {
      navigate("/ProfileUserView");
    } else {
      navigate(`/profile/${userId}`);
    }
  };
  // Navigate to full friend list
  const handleFriendView = () => {
    navigate("/friend");
  };

  // Fetch friend preview data
  useEffect(() => {
    if (!usersProfile?.id) {
      return;
    }
    dispatch(fetchFriendPreview(usersProfile.id));
  }, [dispatch, usersProfile?.id]);

  useEffect(() => {}, [friendsData, loading, error]);

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
        {loading ? (
          <div className="profile-friends__loading">Đang tải...</div>
        ) : error ? (
          <div className="profile-friends__error">Lỗi: {error}</div>
        ) : friendsData?.friends?.length > 0 ? (
          friendsData.friends.slice(0, 5).map((friend) => (
            <div key={friend.friendId} className="profile-friends__item">
              <img
                src={friend.pictureProfile || avatarDefaut}
                alt={friend.fullName}
                className="profile-friends__avatar"
              />
              <span
                className="profile-friends__name"
                onClick={() => navigateUser(friend.friendId)}
              >
                {friend.fullName}
              </span>
            </div>
          ))
        ) : (
          <div className="profile-friends__empty">Không có bạn bè nào</div>
        )}
      </div>
    </div>
  );
};

export default ProfileFriends;
