import React, { useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import {
  IoShareSocialOutline,
  IoPersonAddOutline,
  IoChatbubbleOutline,
} from "react-icons/io5";
import { FaUserCheck, FaUserClock } from "react-icons/fa";
import {
  sendFriendRequest,
  cancelFriendRequest,
  acceptFriendRequest,
  fetchListFriend,
  fetchListFriendReceive,
  fetchSentFriendRequests,
} from "../stores/action/friendAction";
import { fetchShares } from "../stores/action/shareAction";
import getUserIdFromToken from "../utils/JwtDecode";
import avatarWeb from "../assets/AvatarDefault.png";
import "../styles/InteractorModal.scss";

const InteractorShareModal = ({
  isOpen,
  onClose,
  sharesData,
  isLoading,
  error,
  postId,
}) => {
  const dispatch = useDispatch();
  const observerRef = useRef(null);
  const loadMoreRef = useRef(null);
  const loggedInUserId = getUserIdFromToken(); // Get logged-in user ID

  // Redux selectors for friend-related data and shares
  const friendsData = useSelector(
    (state) => state.friends.listFriends?.friends || []
  );
  const friendRequests = useSelector(
    (state) => state.friends.listFriendReceived || []
  );
  const sentRequests = useSelector(
    (state) => state.friends.sentFriendRequests || []
  );
  const { sharesLoading, postShares, sharesError } = useSelector(
    (state) => state.posts
  );

  // Debug friend data and shares
  useEffect(() => {
    if (isOpen) {
      console.log("Friends Data:", friendsData);
      console.log("Friend Requests Received:", friendRequests);
      console.log("Sent Friend Requests:", sentRequests);
      console.log("Logged-in User ID:", loggedInUserId);
      console.log("Post Shares:", postShares);
      console.log("Shares Data (prop):", sharesData);
      console.log("Shares Loading:", sharesLoading);
      console.log("Shares Error:", sharesError);
    }
  }, [
    friendsData,
    friendRequests,
    sentRequests,
    isOpen,
    loggedInUserId,
    postShares,
    sharesData,
    sharesLoading,
    sharesError,
  ]);

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
        toast.error(
          "Không thể tải dữ liệu bạn bè: " +
            (error.message || "Lỗi không xác định")
        );
      }
    };
    loadFriendData();
  }, [dispatch, isOpen]);

  // Load more shares with infinite scroll
  const loadMoreShares = useCallback(() => {
    if (sharesLoading || !sharesData?.nextCursor) return;
    dispatch(fetchShares({ postId, lastUserid: sharesData.nextCursor }));
  }, [dispatch, postId, sharesData?.nextCursor, sharesLoading]);

  // Set up IntersectionObserver for infinite scroll
  useEffect(() => {
    if (!loadMoreRef.current || !isOpen) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadMoreShares();
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
  }, [loadMoreShares, isOpen]);

  // Handle sending friend request
  const handleAddFriend = useCallback(
    async (userId) => {
      if (!userId) {
        toast.error("ID người dùng không hợp lệ");
        return;
      }
      try {
        console.log("Sending friend request to:", userId);
        await dispatch(sendFriendRequest(userId)).unwrap();
        toast.success("Đã gửi lời mời kết bạn");
        await dispatch(fetchSentFriendRequests());
      } catch (error) {
        console.error("Error sending friend request:", error);
        toast.error(
          error.message || "Gửi lời mời thất bại: Người dùng không tồn tại?"
        );
      }
    },
    [dispatch]
  );

  // Handle canceling sent friend request
  const handleCancelRequest = useCallback(
    async (userId) => {
      if (!userId) {
        toast.error("ID người dùng không hợp lệ");
        return;
      }
      try {
        console.log("Canceling friend request to:", userId);
        await dispatch(cancelFriendRequest(userId)).unwrap();
        toast.success("Đã hủy lời mời kết bạn");
        await dispatch(fetchSentFriendRequests());
      } catch (error) {
        console.error("Error canceling friend request:", error);
        toast.error(error.message || "Hủy lời mời thất bại");
      }
    },
    [dispatch]
  );

  // Handle accepting friend request
  const handleAcceptRequest = useCallback(
    async (userId) => {
      if (!userId) {
        toast.error("ID người dùng không hợp lệ");
        return;
      }
      try {
        console.log("Accepting friend request from:", userId);
        await dispatch(acceptFriendRequest(userId)).unwrap();
        toast.success("Đã chấp nhận lời mời kết bạn");
        await Promise.all([
          dispatch(fetchListFriend()),
          dispatch(fetchListFriendReceive()),
        ]);
      } catch (error) {
        console.error("Error accepting friend request:", error);
        toast.error(error.message || "Chấp nhận lời mời thất bại");
      }
    },
    [dispatch]
  );

  // Handle messaging (placeholder, same as InteractorModal)
  const handleMessage = useCallback((userId) => {
    toast.info(`Mở tin nhắn với user ${userId}`);
  }, []);

  // Determine button to display based on friendship status
  const getActionButton = (user) => {
    if (user.id === loggedInUserId) {
      return null; // No button for logged-in user
    }

    console.log("Checking user:", user.id, user.fullName);
    const isFriend = friendsData.some((friend) => friend.friendId === user.id);
    const hasSentRequest = sentRequests.some(
      (request) => request.friendId === user.id
    );
    const hasReceivedRequest = friendRequests.some(
      (request) => request.friendId === user.id
    );

    console.log("Friend Status:", {
      isFriend,
      hasSentRequest,
      hasReceivedRequest,
    });

    if (isFriend) {
      return (
        <button
          className="action-btn message-btn"
          onClick={() => handleMessage(user.id)}
        >
          <IoChatbubbleOutline /> Nhắn tin
        </button>
      );
    } else if (hasSentRequest) {
      return (
        <button
          className="action-btn cancel-request-btn"
          onClick={() => handleCancelRequest(user.id)}
        >
          <FaUserClock /> Hủy lời mời
        </button>
      );
    } else if (hasReceivedRequest) {
      return (
        <button
          className="action-btn accept-btn"
          onClick={() => handleAcceptRequest(user.id)}
        >
          <FaUserCheck /> Chấp nhận
        </button>
      );
    } else {
      return (
        <button
          className="action-btn add-friend-btn"
          onClick={() => handleAddFriend(user.id)}
        >
          <IoPersonAddOutline /> Thêm bạn bè
        </button>
      );
    }
  };

  // Early returns
  if (!isOpen) return null;

  if (error || sharesError) {
    toast.error(
      error?.message ||
        sharesError?.message ||
        "Lỗi khi tải danh sách lượt chia sẻ"
    );
    onClose();
    return null;
  }

  return createPortal(
    <div className="modal-interactor-overlay">
      <div className="modal-interactor-content">
        <div className="modal-header">
          <span className="modal-title">Tất cả người chia sẻ</span>
          <div className="reaction-tabs">
            <span className="reaction-tab">
              <IoShareSocialOutline className="share-icon" />{" "}
              {sharesData?.shareCount || 0}
            </span>
            <span className="close-btn" onClick={onClose}>
              ✖
            </span>
          </div>
        </div>
        <div className="modal-body">
          {isLoading && !sharesData ? (
            <div className="loading-spinner">Đang tải...</div>
          ) : sharesData?.sharedUsers?.length > 0 ? (
            <>
              {sharesData.sharedUsers.map((user) => (
                <div key={user.id} className="user-row">
                  <div className="user-info">
                    <img
                      src={user.profilePicture || avatarWeb}
                      alt={user.fullName}
                      className="avatar"
                    />
                    <span className="user-name">{user.fullName}</span>
                  </div>
                  {getActionButton(user)}
                </div>
              ))}
              <div ref={loadMoreRef} className="load-more-indicator">
                {sharesLoading && (
                  <div className="loading-spinner">Đang tải thêm...</div>
                )}
                {!sharesLoading && sharesData.nextCursor && (
                  <div>Kéo xuống để tải thêm</div>
                )}
              </div>
            </>
          ) : (
            <div className="no-shares">Chưa có lượt chia sẻ nào</div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
};

export default InteractorShareModal;
