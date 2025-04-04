import React, { useEffect ,useState} from "react";
import avatarDefaut from "../assets/AvatarDefault.png";
import closeIcon from "../assets/iconweb/closeIcon.svg";
import "../styles/ShareModal.scss";
import "animate.css";
import { useDispatch } from "react-redux";
import { sharePost } from "../stores/action/listPostActions";


const ShareModal = ({ isOpen, onClose, usersProfile ,post}) => { 
  console.log("chia  se", post)

const[content,setContent ]=  useState ('');
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        onClose();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);
const dispatch = useDispatch();

const handleSharePost = (postId,content) => {
  dispatch(sharePost({
    postId: post.id,
    content: content
  })).then(() => {
    onClose(); // Đóng modal sau khi chia sẻ thành công
  });
}

  if (!isOpen) return null;
 
  return (
    <div className="share-Overlay animate__animated animate__fadeIn ">
      <div className="share-Modal ">
        <div className="head-Share-Modal">
          <span>Chia sẻ</span>
          <img
            src={closeIcon}
            alt="Close"
            onClick={onClose}
            className="close-icon"
          />
        </div>
        <div className="Avar-name-share">
          <img src={usersProfile.profilePicture || avatarDefaut} alt="Avatar" />
          <span className="userName-share">
            {usersProfile.fullName || "University Sharing"}
          </span>
        </div>

        <textarea
          className="share-input"
          placeholder="Viết gì đó cho bài viết này!"
          value ={content}
          onChange={(e) => setContent(e.target.value)}
        ></textarea>
        <button onClick ={()=>handleSharePost(post.id,content)} className="btn-share" type="submit">
          Chia sẻ
        </button>
      </div>
    </div>
  );
};

export default ShareModal;
