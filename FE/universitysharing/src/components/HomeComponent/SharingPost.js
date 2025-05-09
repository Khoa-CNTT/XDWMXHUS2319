import React from "react";
import avatarWeb from "../../assets/AvatarDefault.png";
import "../../styles/SharingPost.scss";
// import { useNavigate } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale"; // Tiếng Việt
import { useDispatch } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import { openCommentModal } from "../../stores/reducers/listPostReducers";
import getUserIdFromToken from "../../utils/JwtDecode";

const SharedPost = ({ post }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const userId = getUserIdFromToken();
  //mở comment modal
  const handleOpenCommentModal = (post, index = 0) => {
    // dispatch(openCommentModal({ ...post, initialMediaIndex: index }));
    navigate(`/post/${post.postId}`, { state: { background: location } });
  };
  const navigateUser = (userId) => {
    if (userId === userId) {
      navigate("/ProfileUserView");
    } else {
      navigate(`/profile/${userId}`);
    }
  };

  //lấy thông hình ảnh và video set lên post nhiều hay 1 ảnh và 1 video
  const getMediaContainerClass = (post) => {
    const imageCount = post.imageUrl ? post.imageUrl.split(",").length : 0;
    const hasVideo = !!post.videoUrl;
    const totalMedia = imageCount + (hasVideo ? 1 : 0);

    let className = "media-container";
    switch (totalMedia) {
      case 1:
        className += hasVideo ? " single-video" : " single-image";
        break;
      case 2:
        className += " two-items";
        if (hasVideo) className += " has-video";
        break;
      default:
        if (totalMedia >= 3) {
          className += " multi-items";
          if (hasVideo) className += " has-video";
        }
    }
    return className;
  };

  // Trong AllPosts
  const renderMediaItems = (post) => {
    const imageUrls = post.imageUrl ? post.imageUrl.split(",") : [];
    const hasVideo = !!post.videoUrl;
    const totalMedia = imageUrls.length + (hasVideo ? 1 : 0);
    // Nếu không có ảnh lẫn video, không render media-container
    if (totalMedia === 0) return null;
    return (
      <div className={getMediaContainerClass(post)}>
        {imageUrls.map((url, index) => {
          const fullUrl = url.startsWith("http")
            ? url.trim()
            : `https://localhost:7053${url.trim()}`;
          // Hiển thị overlay trên ảnh thứ 2 nếu có > 2 media, hoặc trên ảnh đầu tiên nếu có video và > 1 ảnh
          const showOverlay = totalMedia > 2 && index === (hasVideo ? 0 : 1);

          // Hiển thị tối đa 1 ảnh nếu có video, hoặc 2 ảnh nếu không có video
          if (totalMedia > 2 && index > (hasVideo ? 0 : 1)) return null;
          if (hasVideo && index > 0) return null; // Chỉ hiển thị 1 ảnh nếu có video

          return (
            <div className="media-item" key={index}>
              <img
                src={fullUrl}
                alt={`Post media ${index}`}
                onClick={() => handleOpenCommentModal(post, index)}
              />
              {showOverlay && (
                <div
                  className="media-overlay"
                  // onClick={() => handleOpenCommentModal(post, index)}
                >
                  +{totalMedia - (hasVideo ? 1 : 2)}
                </div>
              )}
            </div>
          );
        })}
        {hasVideo && (
          <div className="media-item video-item">
            <video
              controls
              // onClick={() => handleOpenCommentModal(post, imageUrls.length)}
            >
              <source src={post.videoUrl} type="video/mp4" />
            </video>
          </div>
        )}
      </div>
    );
  };
  return (
    <div className="shared-post-container">
      <div className="post-share" key={post.id}>
        {/* Header Post */}
        <div className="header-post-share">
          <p className="AvaName-share">
            <img
              className="avtardefaut-share"
              src={post.originalPost.author.profilePicture || avatarWeb}
              alt="Avatar"
            />
            <strong
              onClick={() => navigateUser(post.originalPost.author.userId)}
            >
              {post.originalPost.author.userName || "University Sharing"}
            </strong>
            <span className="timePost-share">
              {formatDistanceToNow(new Date(post.originalPost.createAt), {
                addSuffix: true,
                locale: vi,
              })}
            </span>
          </p>
          {/* <p className="closemore">
            <img className="btn-edit" src={moreIcon} alt="More" />
            <img className="btn-close" src={closeIcon} alt="Close" />
          </p> */}
        </div>

        {/* Nội dung bài viết */}
        <span className="content-posts-share">{post.originalPost.content}</span>

        {renderMediaItems(post.originalPost)}
      </div>
    </div>
  );
};

export default SharedPost;
