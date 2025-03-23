import React, { useState, useEffect, useRef } from "react";
import logoweb from "../assets/Logo.png";
import avatarDefaut from "../assets/AvatarDefault.png";
import "../styles/CommentOverlay.scss";
import ImagePostComment from "./CommentModel_Component/imagePost";
import ContentPostComment from "./CommentModel_Component/ContenPostComment";
import CommentList from "./CommentModel_Component/CommentList";

const CommentModal = ({ post, onClose }) => {
  // Này là State để bữa sau đảm bảo dữ liệu vào truyền tư AllPost vào
  const [content, setcontent] = useState([
    {
      id: 1,
      username: "Nguyễn Thành Chè",
      content: "Cảnh này thật quen thuộc",
      avatar: avatarDefaut,
      like: 2000,
      islike: false,
      comments: 0,
      share: 20,
    },
  ]);
  // Này là Data đưa comment vào
  const [comments, setComments] = useState([
    {
      id: 1,
      username: "Nguyễn Thành Đảng",
      text: "Thật là đẹp tuyệt vời",
      likes: 20,
      islike: false,
      replies: [
        {
          id: 101,
          username: "Nguyễn Thành Đảng",
          text: "Tôi cũng thấy vậy!",
          likes: 10,
          islike: false,
        },
      ],
    },
  ]);

  //like bài viết
  const handleLike = (postid) => {
    setcontent(
      content.map((post) =>
        post.id === postid
          ? {
              ...post,
              islike: !post.islike,
              like: post.islike ? post.like - 1 : post.like + 1,
            }
          : post
      )
    );
  };
  //Đếm số lượng comment trong state (có thể sau sẽ bỏ vì có API)
  const totalComment = comments.reduce(
    (total, comment) =>
      total + 1 + (comment.replies ? comment.replies.length : 0),
    0
  );

  useEffect(() => {
    setcontent((prevContent) =>
      prevContent.map((post) =>
        post.id === 1 ? { ...post, comments: totalComment } : post
      )
    );
  }, [totalComment]); // Cập nhật khi totalComment thay đổi

  // Tắt bằng nút trên phím
  useEffect(() => {
    const handleKeyClose = (event) => {
      if (event.key === "Escape") {
        onClose();
      }
    };
    document.addEventListener("keydown", handleKeyClose);
    return () => {
      document.removeEventListener("keydown", handleKeyClose);
    };
  }, [onClose]);

  //like commnetcommnet
  const handleLikeComment = (commentid) => {
    setComments(
      comments.map((comment) =>
        comment.id === commentid
          ? {
              ...comment,
              islike: !comment.islike,
              likes: comment.islike ? comment.likes - 1 : comment.likes + 1,
            }
          : comment
      )
    );
  };
  //like comment rely
  const handleLikeCommentRely = (commentReplyid) => {
    setComments(
      comments.map((comment) => ({
        ...comment,
        replies: comment.replies.map((reply) =>
          reply.id === commentReplyid
            ? {
                ...reply,
                islike: !reply.islike,
                likes: reply.islike ? reply.likes - 1 : reply.likes + 1,
              }
            : reply
        ),
      }))
    );
  };

  //Thêm comment
  const commentsEndRef = useRef(null);
  const [commentText, setCommentText] = useState(""); // Lưu nội dung comment
  const addComment = (postId) => {
    if (commentText.trim() === "") return; // Không cho phép comment rỗng

    const newComment = {
      id: new Date().getTime(), // Tạo ID ngẫu nhiên
      username: "Nguyễn Văn A",
      text: commentText,
      likes: 0,
      islike: false,
      replies: [],
    };

    // Cập nhật state comments
    setComments((prevComments) => [...prevComments, newComment]);

    // Cập nhật số lượng comments trong content
    setcontent((prevContent) =>
      prevContent.map((post) =>
        post.id === postId ? { ...post, comments: post.comments + 1 } : post
      )
    );

    setCommentText(""); // Xóa nội dung input sau khi đăng
    // Scroll xuống bình luận mới nhất
    setTimeout(() => {
      if (commentsEndRef.current) {
        commentsEndRef.current.scrollIntoView({
          behavior: "smooth",
          block: "end",
        });
      }
    }, 100);
  };

  //Rely comment
  const relyScroll = useRef(null);
  const [replyText, setReplyText] = useState(""); // Lưu nội dung reply
  const [replyingTo, setReplyingTo] = useState({
    commentId: null,
    replyId: null,
  });
  const replyInputRef = useRef(null); // Lưu ref của input trả lời

  const replyComment = (commentId) => {
    if (replyText.trim() === "") return; // Không cho phép reply rỗng

    const newReply = {
      id: new Date().getTime(),
      username: "Nguyễn Văn B",
      text: replyText,
      likes: 0,
      islike: false,
    };
    // Cập nhật state comments
    setComments((prevComments) =>
      prevComments.map((comment) =>
        comment.id === commentId
          ? { ...comment, replies: [...comment.replies, newReply] }
          : comment
      )
    );
    // Reset input và ẩn input trả lời
    setReplyText("");
    setReplyingTo(null);

    //Scroll xuống rely mới nhất
    setTimeout(() => {
      if (relyScroll.current) {
        relyScroll.current.scrollIntoView({
          behavior: "smooth",
          block: "end",
        });
      }
    }, 100);
  };

  const handleReplyClick = (commentId) => {
    setReplyingTo((prev) => (prev === commentId ? null : commentId)); // Nếu đang mở reply input cho comment này -> ẩn nó đi
    // Nếu đang mở (replyingTo không phải null), thì scroll xuống input
    setTimeout(() => {
      if (replyInputRef.current) {
        replyInputRef.current.scrollIntoView({
          behavior: "smooth",
          block: "end",
        });
        replyInputRef.current.focus(); // Tự động focus vào ô nhập liệu
      }
    }, 100);
  };
  if (!post) return null;
  return (
    <div className="comment-modal-overlay ">
      <div className="logowebsite">
        <img className="logoUS" src={logoweb} alt="Logo" />
      </div>
      <div className="post-overlay">
        <ImagePostComment></ImagePostComment>

        <div className="content-post animate__animated animate__fadeInRight animate_faster">
          <ContentPostComment
            onClose={onClose}
            content={content}
            handleLike={handleLike}
          ></ContentPostComment>

          {/* Bình luận */}
          <CommentList
            comments={comments}
            handleLikeComment={handleLikeComment}
            handleLikeCommentRely={handleLikeCommentRely}
            handleReplyClick={handleReplyClick}
            replyingTo={replyingTo}
            replyText={replyText}
            setReplyText={setReplyText}
            replyComment={replyComment}
            replyInputRef={replyInputRef}
            commentsEndRef={commentsEndRef}
            relyScroll={relyScroll}
          />
        </div>
        <div className="comment-input animate__animated animate__fadeInUp animate_faster">
          <img className="avatar" src={avatarDefaut} alt="Avatar" />
          <textarea
            type="text"
            placeholder="Nhập vào bình luận"
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
          />
          <button type="submit" onClick={() => addComment(1)}>
            Đăng
          </button>
        </div>
      </div>
    </div>
  );
};
export default CommentModal;
