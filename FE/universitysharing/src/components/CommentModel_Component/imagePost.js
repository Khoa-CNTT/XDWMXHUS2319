import React, { useState, useEffect, useRef } from "react";
import imagePost from "../../assets/ImgDefault.png";
import "../../styles/CommentOverlay.scss";
import backICon from "../../assets/iconweb/backIcon.svg";
import nextIcon from "../../assets/iconweb/nextIcon.svg";
// const ImagePostComment = ({ post }) => {
//   console.log("Data video", post);
//   return (
//     <div className="image-Post animate__animated animate__fadeInLeft animate_faster">
//       {post.videoUrl && post.imageUrl && (
//         <>
//           <div className="back-icon">
//             {" "}
//             <img src={backICon}></img>
//           </div>
//           <div className="next-icon">
//             {" "}
//             <img src={nextIcon}></img>
//           </div>
//         </>
//       )}

//       <img
//         className="post-image"
//         src={post.imageUrl || imagePost}
//         alt="Bài viết"
//       />
//     </div>
//   );
// };
// export default ImagePostComment;

const ImagePostComment = ({ post }) => {
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
  const [isVideo, setIsVideo] = useState(false);

  // Tạo mảng media chứa cả ảnh và video (nếu có)
  const mediaArray = [
    { type: "image", url: post.imageUrl },
    ...(post.videoUrl ? [{ type: "video", url: post.videoUrl }] : []),
  ];

  const handleNext = () => {
    setCurrentMediaIndex((prevIndex) => (prevIndex + 1) % mediaArray.length);
    setIsVideo(
      mediaArray[(currentMediaIndex + 1) % mediaArray.length].type === "video"
    );
  };

  const handlePrev = () => {
    setCurrentMediaIndex(
      (prevIndex) => (prevIndex - 1 + mediaArray.length) % mediaArray.length
    );
    setIsVideo(
      mediaArray[
        (currentMediaIndex - 1 + mediaArray.length) % mediaArray.length
      ].type === "video"
    );
  };

  return (
    <div className="image-Post animate__animated animate__fadeInLeft animate_faster">
      {mediaArray.length > 1 && (
        <>
          <div className="back-icon" onClick={handlePrev}>
            <img src={backICon} alt="Previous" />
          </div>
          <div className="next-icon" onClick={handleNext}>
            <img src={nextIcon} alt="Next" />
          </div>
        </>
      )}

      {isVideo ? (
        <video
          className="post-media"
          controls
          autoPlay
          src={mediaArray[currentMediaIndex].url}
        />
      ) : (
        <img
          className="post-media"
          src={mediaArray[currentMediaIndex].url || imagePost}
          alt="Bài viết"
        />
      )}
    </div>
  );
};

export default ImagePostComment;
