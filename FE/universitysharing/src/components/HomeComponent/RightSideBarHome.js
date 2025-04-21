import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchFriends } from "../../stores/action/friendAction";
import { setActiveFriend } from "../../stores/reducers/friendReducer";
import { checkOnlineUsers } from "../../stores/action/onlineAction"; // Thêm import
import ChatBox from "../MessageComponent/ChatBox";
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

  const { friends, loading: friendsLoading, error: friendsError } = useSelector(
    (state) => state.friends
  );
  const { onlineStatus, loading: onlineLoading, error: onlineError } = useSelector(
    (state) => state.onlineUsers
  );


  const [openChats, setOpenChats] = useState([]);
  const [activeFriend, setActiveFriendLocal] = useState(null);

  useEffect(() => {
    // Gọi fetchFriends để lấy danh sách bạn bè
    dispatch(fetchFriends());
  }, [dispatch]);

  useEffect(() => {
    // Gọi API check-online khi có danh sách bạn bè
    if (friends.length > 0 && !friendsLoading && !friendsError) {
      const friendIds = friends.map((friend) => friend.friendId);
      dispatch(checkOnlineUsers(friendIds));
    }
  }, [friends, friendsLoading, friendsError, dispatch]);

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

  const getLastSeenText = useCallback((lastSeen) => {
    if (!lastSeen) return "";
    const diff = (new Date() - new Date(lastSeen)) / 1000 / 60;
    if (diff < 1) return "Vừa mới hoạt động";
    if (diff < 60) return `Hoạt động ${Math.floor(diff)} phút trước`;
    return `Hoạt động ${Math.floor(diff / 60)} giờ trước`;
  }, []);

  const sortedFriends = useMemo(() => {
    return [...friends].sort((a, b) => {
      const isOnlineA = onlineStatus[a.friendId] ?? false;
      const isOnlineB = onlineStatus[b.friendId] ?? false;
      if (isOnlineA && !isOnlineB) return -1;
      if (!isOnlineA && isOnlineB) return 1;
      if (!isOnlineA && !isOnlineB) {
        const lastSeenA = new Date(a.lastSeen || 0).getTime();
        const lastSeenB = new Date(b.lastSeen || 0).getTime();
        return lastSeenB - lastSeenA;
      }
      return 0;
    });
  }, [friends, onlineStatus]);

  if (friendsLoading || onlineLoading) {
    return (
      <aside className="right-sidebar">
        <p>Đang tải...</p>
      </aside>
    );
  }

  if (friendsError) {
    return (
      <aside className="right-sidebar">
        <p>Lỗi tải danh sách bạn bè: {friendsError}</p>
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
        {onlineError && (
          <p className="error-message">Lỗi tải trạng thái online: {onlineError}</p>
        )}
        <div className="friends-list">
          <ul>

            {sortedFriends.map((friend) => {
              const isOnline = onlineStatus[friend.friendId] ?? false;
              return (
                <li
                  key={friend.friendId}
                  className={activeFriend === friend.friendId ? "active" : ""}
                  onClick={() => handleFriendClick(friend.friendId)}
                >
                  <div className="friend-info">
                    <img
                      src={friend.pictureProfile || avatarDefault}
                      alt={`${friend.fullName || "Bạn bè"}'s avatar`}
                    />
                    <div className="name-status">
                      <div className="friend-name">{friend.fullName || "Không tên"}</div>
                      <div className="status-container">
                        <span className={`status-dot ${isOnline ? "online" : "offline"}`}></span>
                        <span className="status-text">
                          {isOnline ? "Online" : getLastSeenText(friend.lastSeen)}
                        </span>
                      </div>
                    </div>
                  </div>
                </li>
              );
            })}
            {sortedFriends.length === 0 && (
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