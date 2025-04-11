import React, { useEffect, useRef, useState, useCallback } from "react";
import "../styles/CommentOverlay.scss";
// import logoweb from "../assets/Logo.png";
import logoweb from "../assets/Logo white.png";
import avatarDefaut from "../assets/AvatarDefault.png";
import defaultPostImage from "../assets/ImgDefault.png"; // Thêm ảnh default vào assets
import ContentPostComment from "./CommentModel_Component/ContenPostComment";
import CommentList from "./CommentModel_Component/CommentList";
import { useDispatch, useSelector } from "react-redux";

import {
  commentPost,
  addCommentPost,
  likeComment,
} from "../stores/action/listPostActions";
import getUserIdFromToken from "../utils/JwtDecode";
import { FiSend, FiChevronLeft, FiChevronRight } from "react-icons/fi";

const CommentModal = ({ post, onClose, usersProfile }) => {
  // console.log("UserProfile>>>>>>>>", usersProfile);
  // console.log("post sercert box", post);
  const userId = getUserIdFromToken();
  const dispatch = useDispatch();
  const commentTextRef = useRef("");
  const commentEndRef = useRef(null);
  const comments = useSelector((state) => state.posts.comments[post.id] || []);

  const [isSending, setIsSending] = useState(false); // Thêm trạng thái loading khi gửi

  const [lastCommentId, setLastCommentId] = useState(null);
  const [loadingMoreComments, setLoadingMoreComments] = useState(false);
  const [hasMoreComments, setHasMoreComments] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(post.initialMediaIndex || 0);

  const imageUrls = post.imageUrl ? post.imageUrl.split(",") : [];
  const hasVideo = !!post.videoUrl;
  const mediaItems = [
    ...imageUrls.map((url) =>
      url.startsWith("http")
        ? url.trim()
        : `https://localhost:7053${url.trim()}`
    ),
    ...(hasVideo ? [post.videoUrl] : []),
  ];

  useEffect(() => {
    const handleKeyClose = (event) => {
      if (event.key === "Escape") {
        onClose();
      }
    };
    document.addEventListener("keydown", handleKeyClose);
    return () => {
      document.removeEventListener("keydown", handleKeyClose);
    };
  }, [onClose]);

  useEffect(() => {
    if (post?.id) {
      dispatch(commentPost({ postId: post.id }));
    }
  }, [dispatch, post?.id]);

  const loadMoreComments = useCallback(() => {
    if (loadingMoreComments || !hasMoreComments || !lastCommentId) return;

    setLoadingMoreComments(true);
    dispatch(
      commentPost({
        postId: post.id,
        lastCommentId,
      })
    )
      .unwrap()
      .then((response) => {
        setHasMoreComments(response.hasMore);
      })
      .finally(() => setLoadingMoreComments(false));
  }, [post.id, lastCommentId, loadingMoreComments, hasMoreComments]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMoreComments) {
          loadMoreComments();
        }
      },
      { threshold: 0.1 }
    );

    if (commentEndRef.current) {
      observer.observe(commentEndRef.current);
    }

    return () => {
      if (commentEndRef.current) {
        observer.unobserve(commentEndRef.current);
      }
    };
  }, [loadMoreComments, hasMoreComments]);

  useEffect(() => {
    if (comments.length > 0) {
      setLastCommentId(comments[comments.length - 1].id);
    }
  }, [comments]);

  const handleInputChange = (e) => {
    commentTextRef.current = e.target.value;
  };

  const handleLikeComment = (commentId) => {
    dispatch(likeComment(commentId));
  };

  const handleAddComment = async () => {
    const text = commentTextRef.current.trim();
    if (!text || isSending) return;

    setIsSending(true);
    try {
      await dispatch(
        addCommentPost({
          postId: post.id,
          content: text,
          userId: userId,
        })
      );
      commentTextRef.current = "";
      document.querySelector("textarea").value = "";
      if (commentEndRef.current) {
        setTimeout(() => {
          commentEndRef.current.scrollIntoView({
            behavior: "smooth",
            block: "end",
          });
        }, 100);
      }
    } finally {
      setIsSending(false);
    }
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : mediaItems.length - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev < mediaItems.length - 1 ? prev + 1 : 0));
  };

  if (!post) return null;

  return (
    <div className="comment-modal-overlay">
      {/* Thêm nút đóng modal */}

      <div className="logowebsite">
        <img className="logoUS" src={logoweb} alt="Logo" />
      </div>

      <div className="post-overlay">
        <div className="image-Post">
          <div className="media-container">
            {mediaItems.length > 0 ? (
              mediaItems[currentIndex].endsWith(".mp4") ? (
                <video className="post-media" controls>
                  <source src={mediaItems[currentIndex]} type="video/mp4" />
                </video>
              ) : (
                <img
                  className="post-media"
                  src={mediaItems[currentIndex]}
                  alt={`Media ${currentIndex}`}
                />
              )
            ) : (
              <img
                className="post-media default-media"
                src={defaultPostImage}
                alt="Default Post Image"
              />
            )}
            {mediaItems.length > 1 && (
              <>
                <button className="nav-button prev-button" onClick={handlePrev}>
                  <FiChevronLeft size={24} />
                </button>
                <button className="nav-button next-button" onClick={handleNext}>
                  <FiChevronRight size={24} />
                </button>
              </>
            )}
          </div>
        </div>

        <div className="content-post">
          <ContentPostComment post={post} onClose={onClose} />

          <CommentList
            post={post}
            comment={comments}
            commentEndRef={commentEndRef}
            handleLikeComment={handleLikeComment}
            onLoadMore={loadMoreComments}
            isLoadingMore={loadingMoreComments}
            hasMoreComments={hasMoreComments}
            usersProfile={usersProfile}
          />
        </div>

        <div className="comment-input">
          <img
            className="avatar"
            src={usersProfile.profilePicture || avatarDefaut}
            alt="Avatar"
          />
          <textarea
            type="text"
            placeholder="Viết bình luận..."
            onChange={handleInputChange}
            onKeyPress={(e) => e.key === "Enter" && handleAddComment()}
          />
          <button type="submit" onClick={handleAddComment} disabled={isSending}>
            {isSending ? <div className="spinner"></div> : <FiSend size={20} />}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CommentModal;
