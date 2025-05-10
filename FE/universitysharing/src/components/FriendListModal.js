import React, { useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { IoPersonAddOutline, IoChatbubbleOutline } from "react-icons/io5";
import { FaUserCheck, FaUserClock } from "react-icons/fa";
import {
  sendFriendRequest,
  cancelFriendRequest,
  acceptFriendRequest,
  fetchListFriend,
  fetchListFriendReceive,
  fetchSentFriendRequests,
} from "../stores/action/friendAction";
import getUserIdFromToken from "../utils/JwtDecode";
import avatarDefaut from "../assets/AvatarDefaultFill.png";
import "../styles/FriendListModal.scss";
import { useNavigate } from "react-router-dom";
import { fr } from "date-fns/locale";
const FriendListModal = ({ isOpen, onClose, userId }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const loggedInUserId = getUserIdFromToken();
  const listFriends = useSelector((state) => state.friends.listFriendsByUser);
  const friendsData = useSelector(
    (state) => state.friends.listFriends?.friends || []
  );
  const friendRequests = useSelector(
    (state) => state.friends.listFriendReceived || []
  );
  const sentRequests = useSelector(
    (state) => state.friends.sentFriendRequests || []
  );
  const loading = useSelector((state) => state.friends.loading);
  const error = useSelector((state) => state.friends.error);

  const navigateUser = (loggedInUserId) => {
    if (loggedInUserId === getUserIdFromToken()) {
      navigate("/ProfileUserView");
    } else {
      navigate(`/profile/${loggedInUserId}`);
      onClose(); //           onEditBioClick={handleEditBioClick}
    }
  }; // Load friend-related data on modal open
  useEffect(() => {
    if (!isOpen || !userId) return;
    const loadFriendData = async () => {
      try {
        await Promise.all([
          dispatch(fetchListFriend(userId)), // Friends of the viewed user
          dispatch(fetchListFriend(loggedInUserId)), // Logged-in user's friends
          dispatch(fetchListFriendReceive()),
          dispatch(fetchSentFriendRequests()),
        ]);
      } catch (error) {
        toast.error(
          "Không thể tải dữ liệu bạn bè: " +
            (error.message || "Lỗi không xác định")
        );
      }
    };
    loadFriendData();
  }, [dispatch, isOpen, userId, loggedInUserId]);

  // Debug friend data
  useEffect(() => {
    if (isOpen) {
      console.log("Viewed User Friends:", listFriends);
      console.log("Logged-in User Friends:", friendsData);
      console.log("Friend Requests Received:", friendRequests);
      console.log("Sent Friend Requests:", sentRequests);
      console.log("Logged-in User ID:", loggedInUserId);
    }
  }, [
    listFriends,
    friendsData,
    friendRequests,
    sentRequests,
    isOpen,
    loggedInUserId,
  ]);

  // Handle sending friend request
  const handleAddFriend = useCallback(
    async (friendId) => {
      if (!friendId) {
        toast.error("ID người dùng không hợp lệ");
        return;
      }
      try {
        await dispatch(sendFriendRequest(friendId)).unwrap();
        toast.success("Đã gửi lời mời kết bạn");
        await dispatch(fetchSentFriendRequests());
      } catch (error) {
        toast.error(error.message || "Gửi lời mời thất bại");
      }
    },
    [dispatch]
  );

  // Handle canceling sent friend request
  const handleCancelRequest = useCallback(
    async (friendId) => {
      if (!friendId) {
        toast.error("ID người dùng không hợp lệ");
        return;
      }
      try {
        await dispatch(cancelFriendRequest(friendId)).unwrap();
        toast.success("Đã hủy lời mời kết bạn");
        await dispatch(fetchSentFriendRequests());
      } catch (error) {
        toast.error(error.message || "Hủy lời mời thất bại");
      }
    },
    [dispatch]
  );

  // Handle accepting friend request
  const handleAcceptRequest = useCallback(
    async (friendId) => {
      if (!friendId) {
        toast.error("ID người dùng không hợp lệ");
        return;
      }
      try {
        await dispatch(acceptFriendRequest(friendId)).unwrap();
        toast.success("Đã chấp nhận lời mời kết bạn");
        await Promise.all([
          dispatch(fetchListFriend(loggedInUserId)),
          dispatch(fetchListFriendReceive()),
        ]);
      } catch (error) {
        toast.error(error.message || "Chấp nhận lời mời thất bại");
      }
    },
    [dispatch, loggedInUserId]
  );

  // Handle messaging (placeholder)
  const handleMessage = useCallback((friendId) => {
    toast.info(`Mở tin nhắn với user ${friendId}`);
  }, []);

  // Determine button to display based on friendship status
  const getActionButton = (friend) => {
    if (friend.friendId === loggedInUserId) {
      return null; // No button for logged-in user
    }

    const isFriend = friendsData.some((f) => f.friendId === friend.friendId);
    const hasSentRequest = sentRequests.some(
      (r) => r.friendId === friend.friendId
    );
    const hasReceivedRequest = friendRequests.some(
      (r) => r.friendId === friend.friendId
    );

    console.log("Friend Status:", {
      friendId: friend.friendId,
      fullName: friend.fullName,
      isFriend,
      hasSentRequest,
      hasReceivedRequest,
    });

    if (isFriend) {
      return (
        <button
          className="friend-list-action-btn friend-list-message-btn"
          onClick={() => handleMessage(friend.friendId)}
        >
          <IoChatbubbleOutline /> Nhắn tin
        </button>
      );
    } else if (hasSentRequest) {
      return (
        <button
          className="friend-list-action-btn friend-list-cancel-request-btn"
          onClick={() => handleCancelRequest(friend.friendId)}
        >
          <FaUserClock /> Hủy lời mời
        </button>
      );
    } else if (hasReceivedRequest) {
      return (
        <button
          className="friend-list-action-btn friend-list-accept-btn"
          onClick={() => handleAcceptRequest(friend.friendId)}
        >
          <FaUserCheck /> Chấp nhận
        </button>
      );
    } else {
      return (
        <button
          className="friend-list-action-btn friend-list-add-friend-btn"
          onClick={() => handleAddFriend(friend.friendId)}
        >
          <IoPersonAddOutline /> Thêm bạn bè
        </button>
      );
    }
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="friend-list-modal-overlay">
      <div className="friend-list-modal-content">
        <div className="friend-list-modal-header">
          <span className="friend-list-modal-title">Bạn bè</span>
          <div className="friend-list-tabs">
            <span className="friend-list-tab">
              Tất cả bạn bè ({listFriends?.friends?.length || 0})
            </span>
            <span className="friend-list-close-btn" onClick={onClose}>
              ✕
            </span>
          </div>
        </div>
        <div className="friend-list-modal-body">
          {loading ? (
            <div className="friend-list-loading-spinner">Đang tải...</div>
          ) : error ? (
            <div className="friend-list-no-friends">Lỗi: {error}</div>
          ) : listFriends?.friends?.length > 0 ? (
            <div className="friend-list-container">
              {listFriends.friends.map((friend) => (
                <div key={friend.friendId} className="friend-list-item">
                  <div className="friend-list-info">
                    <img
                      src={friend.pictureProfile || avatarDefaut}
                      alt={friend.fullName}
                      className="friend-list-avatar"
                    />
                    <span
                      className="friend-list-name"
                      onClick={() => navigateUser(friend.friendId)}
                    >
                      {friend.fullName}
                    </span>
                  </div>
                  {getActionButton(friend)}
                </div>
              ))}
            </div>
          ) : (
            <div className="friend-list-no-friends">Không có bạn bè nào</div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
};

export default FriendListModal;
