import React, { useEffect, useRef } from "react";
import "../../styles/CommentOption.scss";
import { useDispatch, useSelector } from "react-redux";
import { deleteComments } from "../../stores/action/listPostActions";
import { debounce } from "lodash";
import { confirmAlert } from "react-confirm-alert";
import "react-confirm-alert/src/react-confirm-alert.css";

const CommentOption = ({
  isOwner,
  onClose,
  style,
  idComment,
  post,
  onEdit,
}) => {
  const optionRef = useRef(null);
  const dispatch = useDispatch();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (optionRef.current && !optionRef.current.contains(event.target)) {
        console.log("Click outside -> Đóng CommentOption");
        onClose(); // Gọi hàm đóng khi click bên ngoài
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [onClose]);

  const handleDeleteComments = debounce((postId, commentId) => {
    dispatch(deleteComments({ postId, commentId }));
  }, 1000);

  // Hiển thị hộp thoại xác nhận trước khi xóa
  const confirmDeleteComment = (postId, commentId) => {
    confirmAlert({
      title: "Xác nhận xóa bình luận!",
      message: "Bạn muốn xóa bình luận này không?",
      buttons: [
        {
          label: "Có",
          onClick: () => handleDeleteComments(postId, commentId), // Gọi hàm debounce đúng cách
        },
        {
          label: "Không",
          onClick: () => console.log("Hủy xóa"),
        },
      ],
    });
  };

  const handleEditClick = (event) => {
    event.stopPropagation(); // Ngăn sự kiện lan truyền
    onEdit(); // Gọi hàm chỉnh sửa
    onClose(); // Chủ động đóng menu
  };

  return (
    <div className="comment-options" ref={optionRef} style={{ ...style }}>
      {isOwner ? (
        <>
          <span className="update-comment" onClick={handleEditClick}>
            Sửa bình luận
          </span>
          <span
            className="delete-comment"
            onClick={(event) => {
              event.stopPropagation(); // Ngăn sự kiện lan truyền
              confirmDeleteComment(post.id, idComment);
            }}
          >
            Xóa bình luận
          </span>
        </>
      ) : (
        <span
          className="report-comment"
          onClick={(event) => event.stopPropagation()} // Ngăn sự kiện lan truyền
        >
          Báo cáo bình luận
        </span>
      )}
    </div>
  );
};

export default CommentOption;
