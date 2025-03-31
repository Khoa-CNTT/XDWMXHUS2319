import React, { useState, useRef, useEffect } from "react";
import "../../styles/CommentOverlay.scss";
import avatarDefaut from "../../assets/AvatarDefault.png";
import likeIcon from "../../assets/iconweb/likeIcon.svg";
import likeIconFill from "../../assets/iconweb/likefillIcon.svg";
import moreIcon from "../../assets/iconweb/moreIcon.svg";

import { getReplyComment } from "../../stores/action/listPostActions";
import { useDispatch } from "react-redux";
import { debounce } from "lodash";

import CommentOption from "./CommentOption";
import getUserIdFromToken from "../../utils/JwtDecode";

const CommentItem = ({
  comments,
  handleLikeComment,
  post,
  handleReplyComment,
}) => {
  const dispatch = useDispatch();
  //console.log("Dũ liệu comment ", comments.id);
  const [isReplying, setIsReplying] = useState(false); // Kiểm soát hiển thị input
  const [replyText, setReplyText] = useState(""); // Lưu nội dung nhập vào
  const [replyingCommentId, setReplyingCommentId] = useState(null); // Lưu ID của comment đang được trả lời
  const [replyingTo, setReplyingTo] = useState(""); // Lưu tên người được trả lời

  const replyInputTargert = useRef(null);
  const moreReplyTargert = useRef(null);

  const handleReplyClick = (commentId, userName) => {
    //console.log("CommentId và userName>>", commentId, userName);
    setReplyingTo(userName); // Lưu tên người được trả lời
    setReplyingCommentId(commentId); // Cập nhật commentId đang trả lời
    setIsReplying(!isReplying); // Khi click, đảo trạng thái true/false
    setReplyText(`@${userName} `); // Gán sẵn nội dung
    setTimeout(() => {
      if (replyInputTargert.current) {
        replyInputTargert.current.scrollIntoView({
          behavior: "smooth",
          block: "end",
        });
      }
    }, 100);
  };
  //Submit reply
  const handleSendReply = () => {
    if (!replyingCommentId || !replyText.trim()) return;
    console.log("Id cha>>", replyingCommentId);
    console.log("Content>>", replyText);

    handleReplyComment(replyingCommentId, replyText); // Gửi lên cha
    setIsReplying(false);
    setReplyText(""); // Reset input
  };

  const handleChange = (e) => {
    const text = e.target.value;

    // Luôn giữ phần "@TênNgườiDùng " không bị xóa
    if (!text.startsWith(`@${replyingTo} `)) {
      // setReplyText(`@${replyingTo} `);
      setReplyText(e.target.value); // Không bắt buộc giữ @TênNgườiDùng
    } else {
      setReplyText(text);
    }
  };

  //hàm lấy thêm replyComment
  const handleGetReplyComment = debounce((commentid) => {
    dispatch(getReplyComment(commentid));
    setTimeout(() => {
      if (moreReplyTargert.current) {
        moreReplyTargert.current.scrollIntoView({
          behavior: "smooth",
          block: "end",
        });
      }
    }, 300); // Đợi 300ms để React cập nhật UI xong
  }, 1000);

  // const userId = getUserIdFromToken();

  //Mở menuOption
  const [openOptionId, setOpenOptionId] = useState(null); // Lưu ID của comment/reply đang mở menu
  const menuRef = useRef(null);
  const userId = getUserIdFromToken();

  // Đóng menu khi click bên ngoài
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpenOptionId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <>
      <div className="comment-wrapper">
        <div className="comment" style={{ position: "relative" }}>
          <img
            className="avatar"
            src={comments.profilePicture || avatarDefaut}
            alt="Avatar"
          />
          <div className="comment-content">
            <span className="comment-username">{comments.userName}</span>
            <p></p>
            <span className="comment-text">{comments.content}</span>
          </div>
          <img
            className="more-options"
            src={moreIcon}
            alt="More"
            onClick={() =>
              setOpenOptionId(openOptionId === comments.id ? null : comments.id)
            }
          />
          {/* Hiển thị menu nếu comment này đang mở */}
          {openOptionId === comments.id && (
            <div ref={menuRef}>
              <CommentOption
                isOwner={userId === comments.userId}
                onClose={() => setOpenOptionId(null)}
                style={{ right: "20px", top: "50px" }} // Đặt vị trí menu sát bên nút "..."
                idComment={comments.id}
                post={post}
              />
            </div>
          )}
        </div>

        {/* Like và Trả lời */}
        <div className="comment-actions">
          <img
            className="like-icon"
            src={comments.hasLiked ? likeIconFill : likeIcon}
            alt="Like"
            onClick={() => handleLikeComment(comments.id)}
          />
          <span className="number-like">{comments.likeCountComment}</span>
          <span
            className="reply"
            onClick={() => handleReplyClick(comments.id, comments.userName)}
          >
            Trả lời
          </span>
        </div>

        {/* Reply bình luận */}
        {comments.replies?.length > 0 && (
          <div className="reply-section">
            {comments.replies.map((reply) => (
              <React.Fragment key={reply.id}>
                <div className="reply-comment" style={{ position: "relative" }}>
                  <img
                    className="avatar"
                    src={reply.profilePicture || avatarDefaut}
                    alt="Avatar"
                  />
                  <div className="reply-content">
                    <span className="reply-username">{reply.userName}</span>
                    <p></p>
                    <span className="reply-text">{reply.content}</span>
                  </div>
                  <img
                    className="more-options"
                    src={moreIcon}
                    alt="More"
                    onClick={() =>
                      setOpenOptionId(
                        openOptionId === reply.id ? null : reply.id
                      )
                    }
                  />
                  {/* Hiển thị menu nếu reply này đang mở */}
                  {openOptionId === reply.id && (
                    <div ref={menuRef}>
                      <CommentOption
                        isOwner={userId === reply.userId}
                        onClose={() => setOpenOptionId(null)}
                        style={{ right: "20px", top: "50px" }}
                        idComment={reply.id}
                        post={post}
                      />
                    </div>
                  )}
                </div>
                <div className="comment-rely-actions">
                  <img
                    className="like-rely-icon"
                    src={reply.hasLiked ? likeIconFill : likeIcon}
                    alt="Like"
                    onClick={() => handleLikeComment(reply.id)}
                  />
                  <span className="number-rely-like">
                    {reply.likeCountComment}
                  </span>
                  <span
                    className="reply-comment"
                    onClick={() => handleReplyClick(reply.id, reply.userName)}
                  >
                    Trả lời
                  </span>
                </div>
                {/* <div ref={relyScroll}></div> */}
              </React.Fragment>
            ))}
            <div ref={moreReplyTargert}></div>
          </div>
        )}

        {comments.hasMoreReplies && (
          <div
            className="more-reply-comment"
            onClick={() => handleGetReplyComment(comments.id)}
          >
            Xem thêm bình luận{" "}
          </div>
        )}

        {/* Hiển thị input reply nếu người dùng nhấn "Trả lời" */}

        {isReplying && (
          <>
            <div className="reply-input">
              <textarea
                type="text"
                placeholder="Trả lời bình luận..."
                // value={replyText}
                value={replyText}
                onChange={handleChange}
              />
              <button type="submit" onClick={handleSendReply}>
                Trả lời
              </button>
            </div>
            <div ref={replyInputTargert} />
          </>
        )}

        {/* <div ref={replyInputRef} /> */}
      </div>
    </>
  );
};
export default CommentItem;
