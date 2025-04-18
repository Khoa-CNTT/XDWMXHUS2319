import React, { useEffect, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { fetchFriends } from "../../stores/action/friendAction";
import { setActiveFriend } from "../../stores/reducers/friendReducer";

import ChatBox from "../MessageComponent/ChatBox";
import { useAuth } from "../../contexts/AuthContext";
import "../../styles/MessageView/RightSidebar.scss";
import avatarDefault from "../../assets/AvatarDefault.png";

import signalRService from "../../Service/signalRService";
import { jwtDecode } from "jwt-decode";
import {
  FiSearch,
  FiBell,
  FiMessageSquare,
  FiChevronDown,
  FiX,
  FiHome,
} from "react-icons/fi";


const RightSidebar = () => {
  const dispatch = useDispatch();
  const {
    friends = [],
    loading: friendsLoading,
    error: friendsError,
  } = useSelector((state) => state.friends || {});
  console.log("friends", friends);
  const {
    onlineStatus,
    loading: onlineLoading,
    error: onlineError,
  } = useSelector((state) => state.onlineUsers);
  const { token, userId } = useAuth();

  const [openChats, setOpenChats] = useState([]);
  const [activeFriend, setActiveFriendLocal] = useState(null);

  useEffect(() => {
    dispatch(fetchFriends());
  }, [dispatch]);

  const handleFriendClick = useCallback(
    (friendId) => {
      dispatch(setActiveFriend(friendId));
      setActiveFriendLocal(friendId);
      if (!openChats.includes(friendId)) {
        setOpenChats((prev) => [...prev, friendId]);
      }
    },
    [dispatch, openChats]
  );

  const handleCloseChat = useCallback(
    (friendId) => {
      setOpenChats((prev) => prev.filter((id) => id !== friendId));
      if (activeFriend === friendId) {
        dispatch(setActiveFriend(null));
        setActiveFriendLocal(null);
      }
    },
    [activeFriend, dispatch]
  );

  const getLastSeenText = (lastSeen) => {
    if (!lastSeen) return "";
    const diff = (new Date() - new Date(lastSeen)) / 1000 / 60;
    if (diff < 1) return "Vừa mới hoạt động";
    if (diff < 60) return `Hoạt động ${Math.floor(diff)} phút trước`;
    return `Hoạt động ${Math.floor(diff / 60)} giờ trước`;
  };

  if (friendsLoading || onlineLoading) {
    return (
      <aside className="right-sidebar">
        <p>Đang tải...</p>
      </aside>
    );
  }

  if (friendsError || onlineError) {
    return (
      <aside className="right-sidebar">
        <p>Lỗi: {friendsError || onlineError}</p>
      </aside>
    );
  }

  return (
    <>
      <aside className="right-sidebar">
        <div className="search-container">
          <h3>Bạn Bè</h3>
          <div className="search-box">
            <FiSearch className="search-icon" />
            <input type="text" placeholder="Tìm kiếm bạn bè..." />
          </div>
        </div>
        <div className="friends-list">
          <ul>
            {Array.isArray(friends) &&
              [...friends]
                .sort((a, b) => {
                  const isOnlineA = onlineStatus[a.friendId];
                  const isOnlineB = onlineStatus[b.friendId];

                  if (isOnlineA && !isOnlineB) return -1;
                  if (!isOnlineA && isOnlineB) return 1;

                  // Cả hai đều offline -> so sánh thời gian lastSeen
                  if (!isOnlineA && !isOnlineB) {
                    const lastSeenA = new Date(a.lastSeen).getTime();
                    const lastSeenB = new Date(b.lastSeen).getTime();
                    return lastSeenB - lastSeenA; // người mới offline (lastSeen lớn hơn) sẽ nằm trên
                  }

                  return 0; // nếu cả hai online thì không cần đổi vị trí
                })
                .map((friend) => {
                  const isOnline = onlineStatus[friend.friendId];
                  return (
                    <li
                      key={friend.friendId}
                      className={
                        activeFriend === friend.friendId ? "active" : ""
                      }
                      onClick={() => handleFriendClick(friend.friendId)}
                    >
                      <div className="friend-info">
                        <img
                          src={friend.pictureProfile || avatarDefault}
                          alt={`${friend.fullName || "Bạn bè"}'s avatar`}
                        />
                        <div className="name-status">
                          <div className="friend-name">
                            {friend.fullName || "Không tên"}
                          </div>
                          <div
                            className={`status ${
                              isOnline ? "online" : "offline"
                            }`}
                          >
                            {isOnline
                              ? "Online"
                              : getLastSeenText(friend.lastSeen)}
                          </div>
                        </div>
                      </div>
                    </li>
                  );
                })}
            {friends.length === 0 && (
              <div className="loading-error">Không tìm thấy bạn bè.</div>
            )}
          </ul>
        </div>
      </aside>
      {openChats.map((friendId) => (
        <ChatBox
          key={friendId}
          friendId={friendId}
          onClose={() => handleCloseChat(friendId)}
        />
      ))}
    </>
  );
};

export default RightSidebar;
