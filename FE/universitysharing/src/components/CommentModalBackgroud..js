// import React from "react";
// import CommentModal from "./CommentModal";
// import CommentModalNoImg from "./CommentModal-NoImge/CommentNoImage";
// import { useSelector, useDispatch } from "react-redux";
// import { useNavigate } from "react-router-dom";
// import { closeCommentModal } from "../stores/reducers/listPostReducers";

// const CommentModalBackGround = () => {
//   const navigate = useNavigate();
//   const dispatch = useDispatch();
//   const post = useSelector((state) => state.posts.selectedPost);
//   const deepLinkPost = useSelector((state) => state.deeplink.postsLink);
//   const usersState = useSelector((state) => state.users) || {};
//   const { users } = usersState;

//   console.error("post Background: >>", post);
//   console.error("DeepLink Post: >>", deepLinkPost);
//   //Tắt modal đi
//   const handleCloseCommentModal = () => {
//     dispatch(closeCommentModal());
//     navigate(-1);
//   };

//   if (!post) return null;

//   return post.imageUrl ? (
//     <CommentModal
//       post={post}
//       onClose={handleCloseCommentModal}
//       usersProfile={users}
//     />
//   ) : (
//     <CommentModalNoImg
//       post={post}
//       onClose={handleCloseCommentModal}
//       usersProfile={users}
//     />
//   );
// };
// export default CommentModalBackGround;

// import React, { useEffect } from "react";
// import CommentModal from "./CommentModal";
// import CommentModalNoImg from "./CommentModal-NoImge/CommentNoImage";
// import { useSelector, useDispatch } from "react-redux";
// import { useNavigate } from "react-router-dom";
// import { closeCommentModal as closeNormalModal } from "../stores/reducers/listPostReducers";
// import { closeCommentModal as closeDeeplinkModal } from "../stores/reducers/deepLinkReducer";

// const CommentModalBackGround = () => {
//   const navigate = useNavigate();
//   const dispatch = useDispatch();

//   const selectedPost = useSelector((state) => state.posts.selectedPost);
//   const deepLinkPost = useSelector((state) => state.deeplink.postsLink);
//   const isDeeplinkOpen = useSelector(
//     (state) => state.deeplink.isSelectPostOpen
//   );
//   const usersState = useSelector((state) => state.users) || {};
//   const { users } = usersState;

//   // 👉 Ưu tiên deeplink nếu có
//   const post = deepLinkPost?.id ? deepLinkPost : selectedPost;

//   // Nếu không có gì thì không render
//   if (!post) return null;

//   // 👉 Nếu là deeplink thì tắt bằng dispatch của deepLinkReducer
//   const handleCloseCommentModal = () => {
//     if (isDeeplinkOpen) {
//       dispatch(closeDeeplinkModal());
//     } else {
//       dispatch(closeNormalModal());
//     }
//     navigate(-1);
//   };

//   return post.imageUrl ? (
//     <CommentModal
//       post={post}
//       onClose={handleCloseCommentModal}
//       usersProfile={users}
//     />
//   ) : (
//     <CommentModalNoImg
//       post={post}
//       onClose={handleCloseCommentModal}
//       usersProfile={users}
//     />
//   );
// };

// export default CommentModalBackGround;

import React from "react";
import CommentModal from "./CommentModal";
import CommentModalNoImg from "./CommentModal-NoImge/CommentNoImage";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { closeCommentModal as closeNormalModal } from "../stores/reducers/listPostReducers";
import { closeCommentModal as closeDeeplinkModal } from "../stores/reducers/deepLinkReducer";
import { clearDeeplink } from "../stores/reducers/deepLinkReducer"; // Thêm dòng này
const CommentModalBackGround = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const selectedPost = useSelector((state) => state.posts.selectedPost);
  const usersState = useSelector((state) => state.users) || {};
  const { users } = usersState;

  // Nếu có selectedPost → clear deeplink
  React.useEffect(() => {
    if (selectedPost) {
      dispatch(clearDeeplink());
    }
  }, [selectedPost, dispatch]);

  // 👉 Nếu đã có selectedPost thì không cần check deeplink
  const post = useSelector((state) => {
    if (state.posts.selectedPost) {
      return state.posts.selectedPost;
    } else if (state.deeplink.isSelectPostOpen) {
      return state.deeplink.postsLink;
    }
    return null;
  });

  const isDeeplinkOpen = useSelector(
    (state) => state.deeplink.isSelectPostOpen
  );

  if (!post) return null;

  const handleCloseCommentModal = () => {
    if (isDeeplinkOpen && !selectedPost) {
      // 👉 Nếu đang deeplink và KHÔNG phải mở từ selectedPost
      dispatch(closeDeeplinkModal());
      navigate("/home");
    } else {
      dispatch(closeNormalModal());
      navigate(-1);
    }
  };

  return post.imageUrl ? (
    <CommentModal
      post={post}
      onClose={handleCloseCommentModal}
      usersProfile={users}
    />
  ) : (
    <CommentModalNoImg
      post={post}
      onClose={handleCloseCommentModal}
      usersProfile={users}
    />
  );
};

export default CommentModalBackGround;
