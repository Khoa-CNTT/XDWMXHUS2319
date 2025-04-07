
import React, { useEffect, useRef, useState, useCallback } from "react";

import logoweb from "../assets/Logo.png";
import avatarDefaut from "../assets/AvatarDefault.png";
import "../styles/CommentOverlay.scss";
import ImagePostComment from "./CommentModel_Component/imagePost";
import ContentPostComment from "./CommentModel_Component/ContenPostComment";
import CommentList from "./CommentModel_Component/CommentList";
import { useDispatch, useSelector } from "react-redux";


import {
  commentPost,
  addCommentPost,
  likeComment,
} from "../stores/action/listPostActions";
import getUserIdFromToken from "../utils/JwtDecode";
import { FiSend } from "react-icons/fi"; // Thêm icon gửi

const CommentModal = ({ post, onClose, usersProfile }) => {
  const userId = getUserIdFromToken();
  const dispatch = useDispatch();
  const commentTextRef = useRef("");
  const commentEndRef = useRef(null);
  const comments = useSelector((state) => state.posts.comments[post.id] || []);

  const [isSending, setIsSending] = useState(false); // Thêm trạng thái loading khi gửi


  const [lastCommentId, setLastCommentId] = useState(null);
  const [loadingMoreComments, setLoadingMoreComments] = useState(false);
  const [hasMoreComments, setHasMoreComments] = useState(true);
  //console.log("Data bài viết được lưạ chọn>> ", post);

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

  // Load initial comments
  useEffect(() => {
    if (post?.id) {
      dispatch(commentPost({ postId: post.id }));
    }
  }, [dispatch, post?.id]);


  // Load more comments function
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

  // Set up intersection observer
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

  // Update lastCommentId when comments change
  useEffect(() => {
    if (comments.length > 0) {
      setLastCommentId(comments[comments.length - 1].id);
    }
  }, [comments]);
  //Để gõ text

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

  if (!post) return null;
  return (
    <div className="comment-modal-overlay">
      {/* Thêm nút đóng modal */}
    
      
      <div className="logowebsite">
        <img className="logoUS" src={logoweb} alt="Logo" />
      </div>
      
      <div className="post-overlay">
        <ImagePostComment post={post} />

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
          <button 
            type="submit" 
            onClick={handleAddComment}
            disabled={isSending}
          >
            {isSending ? (
              <div className="spinner"></div>
            ) : (
              <FiSend size={20} />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CommentModal;