import React, { useEffect, useRef } from "react";
import logoweb from "../assets/Logo.png";
import avatarDefaut from "../assets/AvatarDefault.png";
import "../styles/CommentOverlay.scss";
import ImagePostComment from "./CommentModel_Component/imagePost";
import ContentPostComment from "./CommentModel_Component/ContenPostComment";
import CommentList from "./CommentModel_Component/CommentList";
import { useDispatch, useSelector } from "react-redux";
import {
  commentPost,
  addCommentPost,
  likeComment,
} from "../stores/action/listPostActions";

const CommentModal = ({ post, onClose, usersProfile }) => {
  console.log("Data bài viết được lưạ chọn>> ", post);
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

  const dispatch = useDispatch();
  const commentTextRef = useRef("");
  const commentEndRef = useRef(null); // Thêm ref để scroll
  const comments = useSelector((state) => state.posts.comments[post.id] || []);

  console.log("Comment trả về>>", comments);

  useEffect(() => {
    if (post?.id) {
      dispatch(commentPost(post.id));
    }
  }, [dispatch, post?.id]);

  const handleInputChange = (e) => {
    commentTextRef.current = e.target.value;
  };

  const handleLikeComment = (commentId) => {
    dispatch(likeComment(commentId));
  };
  const handleAddComment = () => {
    const text = commentTextRef.current.trim();
    if (!text) return;

    dispatch(
      addCommentPost({
        postId: post.id,
        content: text,
      })
    ).then(() => {
      commentTextRef.current = "";
      document.querySelector("textarea").value = "";

      setTimeout(() => {
        if (commentEndRef.current) {
          commentEndRef.current.scrollIntoView({
            behavior: "smooth",
            block: "end",
          });
        }
      }, 1000);
    });
  };

  if (!post) return null;
  return (
    <div className="comment-modal-overlay ">
      <div className="logowebsite">
        <img className="logoUS" src={logoweb} alt="Logo" />
      </div>
      <div className="post-overlay">
        <ImagePostComment post={post} />

        <div className="content-post animate__animated animate__fadeInRight animate_faster">
          <ContentPostComment post={post} onClose={onClose} />
          <CommentList
            comment={comments}
            commentEndRef={commentEndRef}
            handleLikeComment={handleLikeComment}
          />
        </div>

        <div className="comment-input animate__animated animate__fadeInUp animate_faster">
          <img
            className="avatar"
            src={usersProfile.profilePicture || avatarDefaut}
            alt="Avatar"
          />
          <textarea
            type="text"
            placeholder="Nhập vào bình luận"
            onChange={handleInputChange}
          />
          <button type="submit" onClick={handleAddComment}>
            Đăng
          </button>
        </div>
      </div>
    </div>
  );
};

export default CommentModal;

// const addComment = (postId) => {
//   if (commentText.trim() === "") return; // Không cho phép comment rỗng

//   const newComment = {
//     id: new Date().getTime(), // Tạo ID ngẫu nhiên
//     username: "Nguyễn Văn A",
//     text: commentText,
//     likes: 0,
//     islike: false,
//     replies: [],
//   };

//   // Cập nhật state comments
//   setComments((prevComments) => [...prevComments, newComment]);

//   // Cập nhật số lượng comments trong content
//   setcontent((prevContent) =>
//     prevContent.map((post) =>
//       post.id === postId ? { ...post, comments: post.comments + 1 } : post
//     )
//   );

//   setCommentText(""); // Xóa nội dung input sau khi đăng
//   // Scroll xuống bình luận mới nhất
//   setTimeout(() => {
//     if (commentsEndRef.current) {
//       commentsEndRef.current.scrollIntoView({
//         behavior: "smooth",
//         block: "end",
//       });
//     }
//   }, 100);
// };

// //like commnetcommnet
// const handleLikeComment = (commentid) => {
//   setComments(
//     comments.map((comment) =>
//       comment.id === commentid
//         ? {
//             ...comment,
//             islike: !comment.islike,
//             likes: comment.islike ? comment.likes - 1 : comment.likes + 1,
//           }
//         : comment
//     )
//   );
// };
// //like comment rely
// const handleLikeCommentRely = (commentReplyid) => {
//   setComments(
//     comments.map((comment) => ({
//       ...comment,
//       replies: comment.replies.map((reply) =>
//         reply.id === commentReplyid
//           ? {
//               ...reply,
//               islike: !reply.islike,
//               likes: reply.islike ? reply.likes - 1 : reply.likes + 1,
//             }
//           : reply
//       ),
//     }))
//   );
// };

// //Thêm comment
// const commentsEndRef = useRef(null);
// const [commentText, setCommentText] = useState(""); // Lưu nội dung comment

// //Rely comment
// const relyScroll = useRef(null);
// const [replyText, setReplyText] = useState(""); // Lưu nội dung reply
// const [replyingTo, setReplyingTo] = useState({
//   commentId: null,
//   replyId: null,
// });
// const replyInputRef = useRef(null); // Lưu ref của input trả lời

// const replyComment = (commentId) => {
//   if (replyText.trim() === "") return; // Không cho phép reply rỗng

//   const newReply = {
//     id: new Date().getTime(),
//     username: "Nguyễn Văn B",
//     text: replyText,
//     likes: 0,
//     islike: false,
//   };
//   // Cập nhật state comments
//   setComments((prevComments) =>
//     prevComments.map((comment) =>
//       comment.id === commentId
//         ? { ...comment, replies: [...comment.replies, newReply] }
//         : comment
//     )
//   );
//   // Reset input và ẩn input trả lời
//   setReplyText("");
//   setReplyingTo(null);

//   //Scroll xuống rely mới nhất
//   setTimeout(() => {
//     if (relyScroll.current) {
//       relyScroll.current.scrollIntoView({
//         behavior: "smooth",
//         block: "end",
//       });
//     }
//   }, 100);
// };

// const handleReplyClick = (commentId) => {
//   setReplyingTo((prev) => (prev === commentId ? null : commentId)); // Nếu đang mở reply input cho comment này -> ẩn nó đi
//   // Nếu đang mở (replyingTo không phải null), thì scroll xuống input
//   setTimeout(() => {
//     if (replyInputRef.current) {
//       replyInputRef.current.scrollIntoView({
//         behavior: "smooth",
//         block: "end",
//       });
//       replyInputRef.current.focus(); // Tự động focus vào ô nhập liệu
//     }
//   }, 100);
// };
