import React, { useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import "../styles/InteractorShareModal.scss"; // Reuse the same SCSS file
import { IoPersonAddOutline, IoShareSocialOutline } from "react-icons/io5";
import { toast } from "react-toastify";
import { useDispatch, useSelector } from "react-redux";
import { fetchShares } from "../stores/action/shareAction"; // Hypothetical action for fetching shares
import avatarWeb from "../assets/AvatarDefault.png";

const InteractorShareModal = ({
  isOpen,
  onClose,
  sharesData,
  isLoading,
  error,
  postId,
}) => {
  const dispatch = useDispatch();
  const { sharesLoading } = useSelector((state) => state.posts); // Adjust state slice if needed
  const observerRef = useRef(null);
  const loadMoreRef = useRef(null);

  // Define hooks before any early returns
  const loadMoreShares = useCallback(() => {
    if (sharesLoading || !sharesData?.nextCursor) return;
    dispatch(fetchShares({ postId, lastUserid: sharesData.nextCursor }));
  }, [dispatch, postId, sharesData?.nextCursor, sharesLoading]);

  useEffect(() => {
    if (!loadMoreRef.current) return;

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
  }, [loadMoreShares]);

  // Handle early returns after hooks
  if (!isOpen) return null;

  if (error) {
    toast.error(error.message || "Lỗi khi tải danh sách lượt chia sẻ");
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
                <div key={user.userId} className="user-row">
                  <div className="user-info">
                    <img
                      src={user.profilePicture || avatarWeb}
                      alt={user.fullName}
                      className="avatar"
                    />
                    <span className="user-name">{user.fullName}</span>
                  </div>
                  <button className="action-btn">
                    <IoPersonAddOutline /> Thêm bạn bè
                  </button>
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
