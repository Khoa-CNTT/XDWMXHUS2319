import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import {
  cancelFriendRequest,
  fetchSentFriendRequests,
} from "../../stores/action/friendAction";
import "../../styles/FriendViews/FriendViewComponent.scss";
import AvatarDefault from "../../assets/AvatarDefaultFill.png";
import { useNavigate } from "react-router-dom";
import getUserIdFromToken from "../../utils/JwtDecode";
import { toast } from "react-toastify";

const FriendRequestsSent = ({
  requests,
  onLoadMore,
  hasMore,
  loading,
  error,
}) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const userId = getUserIdFromToken();
  const [localRequests, setLocalRequests] = useState(requests); // Local state for immediate UI updates
  const [isCanceling, setIsCanceling] = useState({}); // Track canceling state per request

  // Sync localRequests with props.requests when it changes
  useEffect(() => {
    setLocalRequests(requests);
  }, [requests]);

  const navigateUser = (userId) => {
    if (userId === getUserIdFromToken()) {
      navigate("/ProfileUserView");
    } else {
      navigate(`/profile/${userId}`);
    }
  };

  const handleCancel = async (friendId, fullName) => {
    if (isCanceling[friendId]) return; // Prevent multiple clicks

    setIsCanceling((prev) => ({ ...prev, [friendId]: true }));
    try {
      // Dispatch cancelFriendRequest action
      const result = await dispatch(cancelFriendRequest(friendId)).unwrap();

      // Show success toast
      toast.success(`Đã hủy lời mời kết bạn với ${fullName}`, {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });

      // Update UI immediately by removing the request from local state
      setLocalRequests((prev) =>
        prev.filter((request) => request.friendId !== friendId)
      );

      // Fetch updated sent requests in the background
      dispatch(fetchSentFriendRequests()).catch((error) => {
        console.error("Failed to fetch updated sent requests:", error);
      });
    } catch (error) {
      // Show error toast
      toast.error(error.message || "Hủy lời mời thất bại", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    } finally {
      setIsCanceling((prev) => ({ ...prev, [friendId]: false }));
    }
  };

  return (
    <div className="friend-request-container">
      <h3 className="friend-request-title">Lời mời của bạn</h3>

      {error && <div className="error-message">Lỗi: {error}</div>}
      {loading && localRequests.length === 0 && (
        <div className="loading-message">Đang tải...</div>
      )}
      {!loading && localRequests.length === 0 && !error && (
        <div className="no-requests-message">Không có lời mời đi</div>
      )}

      {localRequests.length > 0 && (
        <div className="friend-request-grid">
          {localRequests.map((request, index) => (
            <div
              key={request.friendId || index}
              className="friend-request-card"
            >
              <div className="friend-info">
                <div className="Avatar-Friend">
                  <img
                    src={request.pictureProfile || AvatarDefault}
                    alt="avatar"
                  />
                </div>
                <label htmlFor={`friend-${index}`}>{request.fullName}</label>
              </div>
              <div className="friend-actions">
                <button
                  className="confirm-btn"
                  disabled={loading || isCanceling[request.friendId]}
                  onClick={() => navigateUser(request.friendId)}
                >
                  Trang cá nhân
                </button>
                <button
                  className="delete-btn"
                  onClick={() =>
                    handleCancel(request.friendId, request.fullName)
                  }
                  disabled={loading || isCanceling[request.friendId]}
                >
                  {isCanceling[request.friendId]
                    ? "Đang xử lý..."
                    : "Hủy lời mời"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {hasMore && (
        <button
          onClick={onLoadMore}
          className="load-more-btn"
          disabled={loading}
        >
          {loading ? "Đang tải..." : "Xem thêm"}
        </button>
      )}
    </div>
  );
};

export default FriendRequestsSent;
