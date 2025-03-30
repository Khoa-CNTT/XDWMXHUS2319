import React, { useEffect, useRef } from "react";
import "../../styles/PostOptionModal.scss";
import PropTypes from "prop-types";
import { useDispatch } from "react-redux";
import { closePostOptionModal } from "../../stores/reducers/listPostReducers";

const PostOptionsModal = ({
  isOwner,
  onClose,
  position,
  postId,
  handleDeletePost,
}) => {
  const modalRef = useRef(null); // Tạo ref để kiểm tra click ra ngoài modal
  console.log("Người chủ>>", isOwner);
  console.log("ID post>>", postId);
  const dispatch = useDispatch();
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        onClose(); // Đóng modal nếu click ra ngoài
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [onClose]);

  useEffect(() => {
    const handleScroll = () => {
      dispatch(closePostOptionModal());
    };

    const scrollContainer = document.querySelector(".center-content"); // Chọn phần tử có class all-posts

    if (scrollContainer) {
      scrollContainer.addEventListener("scroll", handleScroll);
    }

    return () => {
      if (scrollContainer) {
        scrollContainer.removeEventListener("scroll", handleScroll);
      }
    };
  }, [dispatch]);

  return (
    <>
      <div
        className="modal-overlay"
        onClick={onClose}
        style={{ top: `${position.top}px`, left: `${position.left}px` }}
      >
        <div
          className="modal-content"
          onClick={(e) => e.stopPropagation()}
          ref={modalRef}
        >
          {isOwner ? (
            <>
              <p className="option-item option-edit">Chỉnh sửa bài viết</p>
              <p
                className="option-item option-delete"
                onClick={() => {
                  handleDeletePost(postId);
                  onClose();
                }}
              >
                Xóa bài viết
              </p>
            </>
          ) : (
            <p className="option-item option-report">Báo cáo bài viết</p>
          )}
        </div>
      </div>
    </>
  );
};

PostOptionsModal.propTypes = {
  isOwner: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default PostOptionsModal;
