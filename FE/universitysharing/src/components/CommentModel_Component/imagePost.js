import React, { useState, useEffect, useRef } from "react";
import imagePost from "../../assets/ImgDefault.png";
import "../../styles/CommentOverlay.scss";

const ImagePostComment = ({ post }) => {
  return (
    <div className="image-Post animate__animated animate__fadeInLeft animate_faster">
      <img
        className="post-image"
        src={post.imageUrl || imagePost}
        alt="Bài viết"
      />
    </div>
  );
};
export default ImagePostComment;
