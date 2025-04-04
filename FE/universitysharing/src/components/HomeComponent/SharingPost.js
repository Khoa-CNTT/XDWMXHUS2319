import React from "react";
import avatarWeb from "../../assets/AvatarDefault.png";
import imagePost from "../../assets/ImgDefault.png";
import likeIcon from "../../assets/iconweb/likeIcon.svg";
import commentIcon from "../../assets/iconweb/commentIcon.svg";
import shareIcon from "../../assets/iconweb/shareIcon.svg";
import closeIcon from "../../assets/iconweb/closeIcon.svg";
import moreIcon from "../../assets/iconweb/moreIcon.svg";
import "../../styles/SharingPost.scss";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale"; // Tiếng Việt

const SharedPost = ({ post }) => {
  console.log("Post data>>", post);
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
            <strong>
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

        <div
          className={`media-container-share ${
            post.originalPost.imageUrl && post.originalPost.videoUrl
              ? "has-both"
              : ""
          }`}
        >
          {post.originalPost.imageUrl && (
            <div className="postImg-share">
              <img src={post.originalPost.imageUrl} alt="Post" />
            </div>
          )}

          {post.originalPost.videoUrl && (
            <div className="postVideo-share">
              <video controls>
                <source src={post.originalPost.videoUrl} type="video/mp4" />
                Trình duyệt của bạn không hỗ trợ video.
              </video>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SharedPost;
