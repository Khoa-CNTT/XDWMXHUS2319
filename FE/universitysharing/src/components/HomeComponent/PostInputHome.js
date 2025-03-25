import React, { useState } from "react";
import "../../styles/headerHome.scss";
import CreatePostModal from "../CreatePostModal";
const PostInput = ({ usersProfile }) => {
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const openPost = () => {
    setIsShareModalOpen(true);
  };
  const ClosePost = () => {
    setIsShareModalOpen(false);
  };
  return (
    <>
      <div className="post-input" onClick={() => openPost()}>
        <input type="text" readOnly placeholder="Bạn đang nghĩ gì thế?" />
        <button>Đăng</button>
      </div>
      {isShareModalOpen && (
        <CreatePostModal
          isOpen={isShareModalOpen}
          onClose={ClosePost}
          usersProfile={usersProfile}
        ></CreatePostModal>
      )}
    </>
  );
};

export default PostInput;
