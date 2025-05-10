import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/CommentOverlay.scss";
import imagePost from "../../assets/ImgDefault.png";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi"; // Sử dụng icon từ react-icons

const ImagePostComment = ({ post }) => {
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
  const navigate = useNavigate();
  // Tạo mảng media chứa cả ảnh và video (nếu có)
  const mediaArray = [
    ...(post.imageUrl ? [{ type: "image", url: post.imageUrl }] : []),
    ...(post.videoUrl ? [{ type: "video", url: post.videoUrl }] : []),
  ];

  // Kiểm tra nếu media hiện tại là video
  const isVideo = mediaArray[currentMediaIndex]?.type === "video";

  // Xử lý khi nhấn nút Next
  const handleNext = () => {
    setCurrentMediaIndex((prevIndex) => (prevIndex + 1) % mediaArray.length);
  };

  // Xử lý khi nhấn nút Previous
  const handlePrev = () => {
    setCurrentMediaIndex(
      (prevIndex) => (prevIndex - 1 + mediaArray.length) % mediaArray.length
    );
  };
  const homeReturn = () => {
    navigate("/home");
  };

  // Nếu không có media nào, hiển thị ảnh mặc định
  if (!mediaArray.length) {
    return (
      <div className="image-Post">
        <img className="post-media" src={imagePost} alt="Bài viết" />
      </div>
    );
  }

  return (
    <div className="image-Post">
      {isVideo ? (
        <div className="media-container">
          {mediaArray.length > 1 && (
            <>
              <button className="nav-button prev-button" onClick={handlePrev}>
                <FiChevronLeft size={30} />
              </button>
              <button className="nav-button next-button" onClick={handleNext}>
                <FiChevronRight size={30} />
              </button>
            </>
          )}
          <video
            className="post-media"
            controls
            autoPlay
            src={mediaArray[currentMediaIndex].url}
          >
            <source src={mediaArray[currentMediaIndex].url} type="video/mp4" />
            Trình duyệt của bạn không hỗ trợ video.
          </video>
        </div>
      ) : (
        <div className="media-container">
          {mediaArray.length > 1 && (
            <>
              <button className="nav-button prev-button" onClick={handlePrev}>
                <FiChevronLeft size={30} />
              </button>
              <button className="nav-button next-button" onClick={handleNext}>
                <FiChevronRight size={30} />
              </button>
            </>
          )}
          <img
            className="post-media"
            src={mediaArray[currentMediaIndex].url || imagePost}
            alt="Bài viết"
          />
        </div>
      )}
    </div>
  );
};

export default ImagePostComment;
