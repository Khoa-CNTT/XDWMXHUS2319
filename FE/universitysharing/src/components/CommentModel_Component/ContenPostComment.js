import React, { useState, useEffect, useRef } from "react";
import "../../styles/CommentOverlay.scss";
import avatarDefaut from "../../assets/AvatarDefault.png";
import likeIcon from "../../assets/iconweb/likeIcon.svg";
import likeIconFill from "../../assets/iconweb/likefillIcon.svg";
import commentIcon from "../../assets/iconweb/commentIcon.svg";
import moreIcon from "../../assets/iconweb/moreIcon.svg";
import closeIcon from "../../assets/iconweb/closeIcon.svg";
import shareIcon from "../../assets/iconweb/shareIcon.svg";

import { useDispatch, useSelector } from "react-redux";
import { likePost } from "../../stores/action/listPostActions";
import { debounce } from "lodash";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale"; // Tiếng Việt

const ContentPostComment = ({ post, onClose }) => {
  const dispatch = useDispatch();

  const posts = useSelector((state) =>
    state.posts.posts.find((p) => p.id === post.id)
  );
  //Like bài viết
  const handleLikePost = debounce((postId) => {
    dispatch(likePost(postId));
  }, 1000);
  if (!posts) return null; // Tránh lỗi nếu post chưa được truyền xuống
  return (
    <>
      <div className="avatar-and-option">
        <div className="avatar-and-name">
          <img
            className="avatar"
            src={posts.profilePicture || avatarDefaut}
            alt="Avatar"
          />
          <span className="username">{posts.fullName}</span>

          <span className="Time-post-Comments-Modal">
            {" "}
            {formatDistanceToNow(new Date(posts.createdAt), {
              addSuffix: true,
              locale: vi,
            })}
          </span>
        </div>
        <div className="more-options">
          {/* <img src={moreIcon} alt="More" /> */}
          <img src={closeIcon} alt="Close" onClick={onClose} />
        </div>
      </div>
      <span className="post-content">{posts.content}</span>
      <div className="interactions">
        <div className="likes">
          <img
            src={posts.hasLiked ? likeIconFill : likeIcon}
            alt="Like"
            onClick={() => handleLikePost(post.id)}
          />
          <span>{posts.likeCount}</span>
        </div>
        <div className="comments">
          <img src={commentIcon} alt="Comment" />
          <span>{posts.commentCount}</span>
        </div>
        <div className="shares">
          <img src={shareIcon} alt="Share" />
          <span>{posts.shareCount}</span>
        </div>
      </div>
    </>
  );
};
export default ContentPostComment;
