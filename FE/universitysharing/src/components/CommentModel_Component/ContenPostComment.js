import React, { useState, useEffect, useRef } from "react";
import "../../styles/CommentOverlay.scss";
import avatarDefaut from "../../assets/AvatarDefault.png";
import likeIcon from "../../assets/iconweb/likeIcon.svg";
import likeIconFill from "../../assets/iconweb/likefillIcon.svg";
import commentIcon from "../../assets/iconweb/commentIcon.svg";
import moreIcon from "../../assets/iconweb/moreIcon.svg";
import closeIcon from "../../assets/iconweb/closeIcon.svg";
import shareIcon from "../../assets/iconweb/shareIcon.svg";
const ContentPostComment = ({ onClose, content, handleLike }) => {
  return (
    <>
      <div className="avatar-and-option">
        <div className="avatar-and-name">
          <img className="avatar" src={content[0].avatar} alt="Avatar" />
          <span className="username">{content[0].username}</span>
        </div>
        <div className="more-options">
          <img src={moreIcon} alt="More" />
          <img src={closeIcon} alt="Close" onClick={onClose} />
        </div>
      </div>
      <span className="post-content">Cảnh này thật quen thuộc</span>
      <div className="interactions">
        <div className="likes" onc>
          <img
            src={content[0].islike ? likeIconFill : likeIcon}
            alt="Like"
            onClick={() => handleLike(content[0].id)}
          />
          <span>{content[0].like}</span>
        </div>
        <div className="comments">
          <img src={commentIcon} alt="Comment" />
          <span>{content[0].comments}</span>
        </div>
        <div className="shares">
          <img src={shareIcon} alt="Share" />
          <span>{content[0].share}</span>
        </div>
      </div>
    </>
  );
};
export default ContentPostComment;
