import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import {
  acceptFriendRequest,
  rejectFriendRequest,
} from "../../stores/action/friendAction";
import { toast } from "react-toastify";
import "../../styles/FriendViews/FriendViewComponent.scss";
import AvatarDefault from "../../assets/AvatarDefaultFill.png";

const FriendRequestsReceived = ({
  requests,
  onLoadMore,
  hasMore,
  loading,
  error,
}) => {
  const dispatch = useDispatch();
  const [localRequests, setLocalRequests] = useState(requests);
  const [processingIds, setProcessingIds] = useState(new Set());

  // Sync localRequests with props when requests change
  useEffect(() => {
    setLocalRequests(requests);
  }, [requests]);

  const handleAccept = async (friendId) => {
    // Optimistically remove the request from UI
    const originalRequests = [...localRequests];
    setLocalRequests((prev) =>
      prev.filter((request) => request.friendId !== friendId)
    );
    setProcessingIds((prev) => new Set([...prev, friendId]));

    try {
      await dispatch(acceptFriendRequest(friendId)).unwrap();
      toast.success("Đã chấp nhận lời mời kết bạn!", {
        position: "top-right",
        autoClose: 3000,
      });
    } catch (error) {
      // Revert UI if the request fails
      setLocalRequests(originalRequests);
      toast.error(error || "Không thể chấp nhận lời mời", {
        position: "top-right",
        autoClose: 3000,
      });
    } finally {
      setProcessingIds((prev) => {
        const newSet = new Set(prev);
        newSet.delete(friendId);
        return newSet;
      });
    }
  };

  const handleReject = async (friendId) => {
    // Optimistically remove the request from UI
    const originalRequests = [...localRequests];
    setLocalRequests((prev) =>
      prev.filter((request) => request.friendId !== friendId)
    );
    setProcessingIds((prev) => new Set([...prev, friendId]));

    try {
      await dispatch(rejectFriendRequest(friendId)).unwrap();
      toast.success("Đã từ chối lời mời kết bạn!", {
        position: "top-right",
        autoClose: 3000,
      });
    } catch (error) {
      // Revert UI if the request fails
      setLocalRequests(originalRequests);
      toast.error(error || "Không thể từ chối lời mời", {
        position: "top-right",
        autoClose: 3000,
      });
    } finally {
      setProcessingIds((prev) => {
        const newSet = new Set(prev);
        newSet.delete(friendId);
        return newSet;
      });
    }
  };

  return (
    <div className="friend-request-container">
      <h3 className="friend-request-title">Lời mời kết bạn</h3>

      {error && <div className="error-message">Lỗi: {error}</div>}
      {loading && localRequests.length === 0 && (
        <div className="loading-message">Đang tải...</div>
      )}
      {!loading && localRequests.length === 0 && !error && (
        <div className="no-requests-message">Không có lời mời kết bạn</div>
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
                  onClick={() => handleAccept(request.friendId)}
                  disabled={loading || processingIds.has(request.friendId)}
                >
                  {processingIds.has(request.friendId)
                    ? "Đang xử lý..."
                    : "Xác nhận"}
                </button>
                <button
                  className="delete-btn"
                  onClick={() => handleReject(request.friendId)}
                  disabled={loading || processingIds.has(request.friendId)}
                >
                  {processingIds.has(request.friendId)
                    ? "Đang xử lý..."
                    : "Xóa"}
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

export default FriendRequestsReceived;
