import React, { useEffect, useRef, useCallback, useState } from "react";
import { createPortal } from "react-dom";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { FaHeart } from "react-icons/fa";
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
import { fetchLikes } from "../stores/action/likeAction";
import getUserIdFromToken from "../utils/JwtDecode";
import avatarWeb from "../assets/AvatarDefault.png";
import "../styles/InteractorModal.scss";
import ChatBox from "../components/MessageComponent/ChatBox";

const InteractorModal = ({
  isOpen,
  onClose,
  likesData,
  isLoading,
  error,
  postId,
}) => {
  const dispatch = useDispatch();
  const observerRef = useRef(null);
  const loadMoreRef = useRef(null);
  const loggedInUserId = getUserIdFromToken(); // Get logged-in user ID

  const [openChats, setOpenChats] = useState([]); // State to manage open chatboxes

  // Redux selectors for friend-related data
  const friendsData = useSelector(
    (state) => state.friends.listFriends?.friends || []
  );
  const friendRequests = useSelector(
    (state) => state.friends.listFriendReceived || []
  );
  const sentRequests = useSelector(
    (state) => state.friends.sentFriendRequests || []
  );
  const { likesLoading } = useSelector((state) => state.posts);

  // Load friend-related data on mount
  useEffect(() => {
    if (!isOpen) return;
    const loadFriendData = async () => {
      try {
        await Promise.all([
          dispatch(fetchListFriend()),
          dispatch(fetchListFriendReceive()),
          dispatch(fetchSentFriendRequests()),
        ]);
      } catch (error) {
        toast.error("Không thể tải dữ liệu bạn bè");
      }
    };
    loadFriendData();
  }, [dispatch, isOpen]);

  // Load more likes with infinite scroll
  const loadMoreLikes = useCallback(() => {
    if (likesLoading || !likesData?.nextCursor) return;
    dispatch(fetchLikes({ postId, lastUserid: likesData.nextCursor }));
  }, [dispatch, postId, likesData?.nextCursor, likesLoading]);

  // Set up IntersectionObserver for infinite scroll
  useEffect(() => {
    if (!loadMoreRef.current || !isOpen) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadMoreLikes();
        }
      },
      { threshold: 1.0 }
    );

    observerRef.current.observe(loadMoreRef.current);

    return () => {
      if (loadMoreRef.current && observerRef.current) {
        observerRef.current.unobserve(loadMoreRef.current);
      }
    };
  }, [loadMoreLikes, isOpen]);

  // Handle sending friend request
  const handleAddFriend = useCallback(
    async (userId) => {
      try {
        await dispatch(sendFriendRequest(userId)).unwrap();
        toast.success("Đã gửi lời mời kết bạn");
        await dispatch(fetchSentFriendRequests());
      } catch (error) {
        toast.error(error || "Gửi lời mời thất bại");
      }
    },
    [dispatch]
  );

  // Handle canceling sent friend request
  const handleCancelRequest = useCallback(
    async (userId) => {
      try {
        await dispatch(cancelFriendRequest(userId)).unwrap();
        toast.success("Đã hủy lời mời kết bạn");
        await dispatch(fetchSentFriendRequests());
      } catch (error) {
        toast.error(error || "Hủy lời mời thất bại");
      }
    },
    [dispatch]
  );

  // Handle accepting friend request
  const handleAcceptRequest = useCallback(
    async (userId) => {
      try {
        await dispatch(acceptFriendRequest(userId)).unwrap();
        toast.success("Đã chấp nhận lời mời kết bạn");
        await Promise.all([
          dispatch(fetchListFriend()),
          dispatch(fetchListFriendReceive()),
        ]);
      } catch (error) {
        toast.error(error || "Chấp nhận lời mời thất bại");
      }
    },
    [dispatch]
  );

  // Handle messaging (placeholder for now)

  // Handle messaging by opening a chatbox

  const handleMessage = useCallback(
    (userId) => {
      if (!openChats.includes(userId)) {
        setOpenChats((prev) => [...prev, userId]);
      }
    },
    [openChats]
  );

  // Handle closing a chatbox

  const handleCloseChat = useCallback((userId) => {
    setOpenChats((prev) => prev.filter((id) => id !== userId));
  }, []);

  // Determine button to display based on friendship status
  const getActionButton = (user) => {
    if (user.userId === loggedInUserId) {
      return null; // No button for logged-in user
    }

    const isFriend = friendsData.some(
      (friend) => friend.friendId === user.userId
    );
    const hasSentRequest = sentRequests.some(
      (request) => request.friendId === user.userId
    );
    const hasReceivedRequest = friendRequests.some(
      (request) => request.friendId === user.userId
    );

    if (isFriend) {
      return (
        <button
          className="action-btn message-btn"
          onClick={() => handleMessage(user.userId)}
        >
          <IoChatbubbleOutline /> Nhắn tin
        </button>
      );
    } else if (hasSentRequest) {
      return (
        <button
          className="action-btn cancel-request-btn"
          onClick={() => handleCancelRequest(user.userId)}
        >
          <FaUserClock /> Hủy lời mời
        </button>
      );
    } else if (hasReceivedRequest) {
      return (
        <button
          className="action-btn accept-btn"
          onClick={() => handleAcceptRequest(user.userId)}
        >
          <FaUserCheck /> Chấp nhận
        </button>
      );
    } else {
      return (
        <button
          className="action-btn add-friend-btn"
          onClick={() => handleAddFriend(user.userId)}
        >
          <IoPersonAddOutline /> Thêm bạn bè
        </button>
      );
    }
  };

  // Early returns
  if (!isOpen) return null;

  if (error) {
    toast.error(error.message || "Lỗi khi tải danh sách lượt thích");
    onClose();
    return null;
  }

  return createPortal(
    <>
      <div className="modal-interactor-overlay">
        <div className="modal-interactor-content">
          <div className="modal-header">
            <span className="modal-title">Tất cả lượt thích</span>
            <div className="reaction-tabs">
              <span className="reaction-tab">
                <FaHeart className="like-icon" /> {likesData?.likeCount || 0}
              </span>
              <span className="close-btn" onClick={onClose}>
                ✖
              </span>
            </div>
          </div>
          <div className="modal-body">
            {isLoading && !likesData ? (
              <div className="loading-spinner">Đang tải...</div>
            ) : likesData?.likedUsers?.length > 0 ? (
              <>
                {likesData.likedUsers.map((user) => (
                  <div key={user.userId} className="user-row">
                    <div className="user-info">
                      <img
                        src={user.profilePicture || avatarWeb}
                        alt={user.userName}
                        className="avatar"
                      />
                      <span className="user-name">{user.userName}</span>
                    </div>
                    {getActionButton(user)}
                  </div>
                ))}
                <div ref={loadMoreRef} className="load-more-indicator">
                  {likesLoading && (
                    <div className="loading-spinner">Đang tải thêm...</div>
                  )}
                  {!likesLoading && likesData.nextCursor && (
                    <div>Kéo xuống để tải thêm</div>
                  )}
                </div>
              </>
            ) : (
              <div className="no-likes">Chưa có lượt thích nào</div>
            )}
          </div>
        </div>
      </div>
      {openChats.map((userId) => (
        <ChatBox
          key={userId}
          friendId={userId}
          onClose={() => handleCloseChat(userId)}
        />
      ))}
    </>,
    document.body
  );
};

export default InteractorModal;
