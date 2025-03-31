import React, { useEffect, useRef } from "react";
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
import { debounce } from "lodash";

const CommentModal = ({ post, onClose, usersProfile }) => {
  console.log("selectedPost", post);
  const userId = getUserIdFromToken();
  const dispatch = useDispatch();
  const commentTextRef = useRef("");
  const commentEndRef = useRef(null); // Thêm ref để scroll
  const comments = useSelector((state) => state.posts.comments[post.id] || []);
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

  // console.log("Comment trả về>>", comments);

  useEffect(() => {
    if (post?.id) {
      dispatch(commentPost(post.id));
    }
  }, [dispatch, post?.id]);

  //Để gõ text
  const handleInputChange = (e) => {
    commentTextRef.current = e.target.value;
  };
  //Để like comment
  const handleLikeComment = debounce((commentId) => {
    dispatch(likeComment(commentId));
  }, 1000);

  //Thêm Comment
  const handleAddComment = () => {
    const text = commentTextRef.current.trim();
    if (!text) return;

    dispatch(
      addCommentPost({
        postId: post.id,
        content: text,
        userId: userId,
      })
    ).then(() => {
      commentTextRef.current = "";
      document.querySelector("textarea").value = "";

      setTimeout(() => {
        if (commentEndRef.current) {
          commentEndRef.current.scrollIntoView({
            behavior: "smooth",
            block: "end",
          });
        }
      }, 1000);
    });
  };

  if (!post) return null;
  return (
    <div className="comment-modal-overlay ">
      <div className="logowebsite">
        <img className="logoUS" src={logoweb} alt="Logo" />
      </div>
      <div className="post-overlay">
        <ImagePostComment post={post} />

        <div className="content-post animate__animated animate__fadeInRight animate_faster">
          <ContentPostComment post={post} onClose={onClose} />
          <CommentList
            post={post}
            comment={comments}
            commentEndRef={commentEndRef}
            handleLikeComment={handleLikeComment}
          />
        </div>

        <div className="comment-input animate__animated animate__fadeInUp animate_faster">
          <img
            className="avatar"
            src={usersProfile.profilePicture || avatarDefaut}
            alt="Avatar"
          />
          <textarea
            type="text"
            placeholder="Nhập vào bình luận"
            onChange={handleInputChange}
          />
          <button type="submit" onClick={handleAddComment}>
            Đăng
          </button>
        </div>
      </div>
    </div>
  );
};

export default CommentModal;
