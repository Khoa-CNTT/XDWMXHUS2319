import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { createPortal } from "react-dom";
import "../../styles/ProfileUserView/ProfilePhotos.scss";
import { fetchAllPostImages } from "../../stores/action/profileActions";

const ProfilePhotos = ({ usersProfile, isFriendProfile }) => {
  const dispatch = useDispatch();
  const postImages = useSelector((state) => state.users.postImages) || [];
  const allPostImages = useSelector((state) => state.users.allPostImages) || [];
  const loading = useSelector((state) => state.users.loading);
  const error = useSelector((state) => state.users.error);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleViewAll = (e) => {
    e.preventDefault();
    if (usersProfile?.id) {
      dispatch(fetchAllPostImages(usersProfile.id));
      setIsModalOpen(true);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const PhotosModal = () => (
    <div className="profile-photos__modal">
      <div className="profile-photos__modal-content">
        <div className="profile-photos__modal-header">
          <h2>Tất cả ảnh {isFriendProfile ? "của bạn bè" : "của bạn"}</h2>
          <button className="profile-photos__modal-close" onClick={closeModal}>
            ×
          </button>
        </div>
        <div className="profile-photos__modal-grid">
          {loading ? (
            <p>Đang tải ảnh...</p>
          ) : error ? (
            <p>Lỗi: {error}</p>
          ) : allPostImages.length > 0 ? (
            allPostImages.map((image) => (
              <div key={image.postId} className="profile-photos__modal-item">
                <img
                  src={image.imageUrl}
                  alt={`Post ${image.postId}`}
                  className="profile-photos__modal-image"
                  onError={(e) => {
                    console.error(`Failed to load image: ${image.imageUrl}`);
                    e.target.src = "/fallback-image.jpg";
                  }}
                />
              </div>
            ))
          ) : (
            <p>Không có ảnh để hiển thị</p>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="profile-photos">
      <div className="profile-photos__header">
        <h2>Ảnh {isFriendProfile ? "của bạn bè" : "của bạn"}</h2>
        <a
          href="#"
          className="profile-photos__view-all"
          onClick={handleViewAll}
        >
          Xem tất cả
        </a>
      </div>
      <div className="profile-photos__grid">
        {error ? (
          <p>Lỗi: {error}</p>
        ) : loading ? (
          <p>Đang tải ảnh...</p>
        ) : postImages.length > 0 ? (
          postImages.map((image) => (
            <div key={image.postId} className="profile-photos__item">
              <img
                src={image.imageUrl}
                alt={`Post ${image.postId}`}
                className="profile-photos__image"
                onError={(e) => {
                  console.error(`Failed to load image: ${image.imageUrl}`);
                  e.target.src = "/fallback-image.jpg";
                }}
              />
            </div>
          ))
        ) : (
          <p>Không có ảnh để hiển thị</p>
        )}
      </div>

      {/* Render modal vào body qua Portal */}
      {isModalOpen && createPortal(<PhotosModal />, document.body)}
    </div>
  );
};

export default ProfilePhotos;
