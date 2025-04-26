import React, { useEffect, useRef, useState } from "react";
import "../../styles/PostOptionModal.scss";
import PropTypes from "prop-types";
import { useDispatch } from "react-redux";
import { closePostOptionModal } from "../../stores/reducers/listPostReducers";
import ReportModal from "../ReportModal";

import EditModal from "../EditPostModal";

const PostOptionsModal = ({
  isOwner,
  onClose,
  position,
  postId,
  handleDeletePost,
  post,
}) => {
  //console.log("Nội dung>>", post);
  const modalRef = useRef(null); // Tạo ref để kiểm tra click ra ngoài modal
  const dispatch = useDispatch();
  const [isHidden, setIsHidden] = useState(false); // Thêm state để ẩn/hiện modal
  //Update bài viếtviết
  const [isOpenEdit, setOpenEdit] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false); // thêm state

  const handleOpenEditModal = () => {
    setOpenEdit(true);
    setIsHidden(true); // Ẩn PostOptionsModal
  };
  const handleCloseEditModal = () => {
    setOpenEdit(false);
    onClose();
  };
  const handleOpenReportModal = () => {
    setIsReportModalOpen(true);
    setIsHidden(true); // ẩn menu options
  };

  const handleCloseReportModal = () => {
    setIsReportModalOpen(false);
    onClose(); // đóng luôn modal options
  };

  // //đóng PostOption

  // useEffect(() => {
  //   const handleClickOutside = (event) => {
  //     if (modalRef.current && !modalRef.current.contains(event.target)) {
  //       onClose(); // Đóng modal nếu click ra ngoài
  //     }
  //   };

  //   document.addEventListener("click", handleClickOutside);
  //   return () => {
  //     document.removeEventListener("click", handleClickOutside);
  //   };
  // }, [onClose]);

  //Tắt modal khi có sự kiện srcoll
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
      {!isHidden && (
        <div
          className="modal-postOption-overlay"
          // onClick={onClose}
          // style={{ top: `${position.top}px`, left: `${position.left}px` }}
        >
          <div
            className="modal-postOption-content"
            onClick={(e) => e.stopPropagation()}
            ref={modalRef}
          >
            {isOwner ? (
              <>
                <p
                  className="option-item option-edit"
                  onClick={handleOpenEditModal}
                >
                  Chỉnh sửa bài viết
                </p>
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
              <p
                className="option-item option-report"
                onClick={handleOpenReportModal}
              >
                Báo cáo bài viết
              </p>
            )}
          </div>
        </div>
      )}
      {isOpenEdit &&
        (console.log("Render EditModal"),
        (
          <EditModal
            isOpen={isOpenEdit}
            postId={postId}
            post={post}
            onClose={handleCloseEditModal}
          ></EditModal>
        ))}
      {isReportModalOpen && (
        <ReportModal postId={postId} onClose={handleCloseReportModal} />
      )}
    </>
  );
};

PostOptionsModal.propTypes = {
  isOwner: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default PostOptionsModal;
