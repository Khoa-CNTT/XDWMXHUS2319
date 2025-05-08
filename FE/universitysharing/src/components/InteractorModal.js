import React, { useEffect, useRef, useCallback } from "react";
import "../styles/InteractorModal.scss";
import { createPortal } from "react-dom";
import { IoPersonAddOutline } from "react-icons/io5";
import { FaHeart } from "react-icons/fa";
import { toast } from "react-toastify";
import { useDispatch, useSelector } from "react-redux";
import { fetchLikes } from "../stores/action/likeAction"; // Updated import path
import avatarWeb from "../assets/AvatarDefault.png";
const InteractorModal = ({
  isOpen,
  onClose,
  likesData,
  isLoading,
  error,
  postId,
}) => {
  const dispatch = useDispatch();
  const { likesLoading } = useSelector((state) => state.posts);
  const observerRef = useRef(null);
  const loadMoreRef = useRef(null);

  // Define hooks before any early returns
  const loadMoreLikes = useCallback(() => {
    if (likesLoading || !likesData?.nextCursor) return;
    dispatch(fetchLikes({ postId, lastUserid: likesData.nextCursor }));
  }, [dispatch, postId, likesData?.nextCursor, likesLoading]);

  useEffect(() => {
    if (!loadMoreRef.current) return;

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
  }, [loadMoreLikes]);

  // Handle early returns after hooks
  if (!isOpen) return null;

  if (error) {
    toast.error(error.message || "Lỗi khi tải danh sách lượt thích");
    onClose();
    return null;
  }

  return createPortal(
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
                  <button className="action-btn">
                    <IoPersonAddOutline /> Thêm bạn bè
                  </button>
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
    </div>,
    document.body
  );
};

export default InteractorModal;
