import React, { useState, useEffect, useRef } from "react";
import imagePost from "../../assets/ImgDefault.png";
import "../../styles/CommentOverlay.scss";

const ImagePostComment = () => {
  return (
    <div className="image-Post animate__animated animate__fadeInLeft animate_faster">
      <img
        className="post-image"
        src="https://wallpapers.com/images/featured/4k-nature-ztbad1qj8vdjqe0p.jpg"
        alt="Bài viết"
      />
    </div>
  );
};
export default ImagePostComment;
