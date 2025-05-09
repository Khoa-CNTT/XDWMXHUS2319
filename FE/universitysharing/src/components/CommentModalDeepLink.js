import React, { useEffect } from "react";
import CommentModal from "./CommentModal";
import CommentModalNoImg from "./CommentModal-NoImge/CommentNoImage";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { closeCommentModal } from "../stores/reducers/deepLinkReducer";
const CommentModalDeepLink = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const post = useSelector((state) => state.deeplink.postsLink);
  const usersState = useSelector((state) => state.users) || {};
  const { users } = usersState;

  console.error("POST DeepLink : >>", post);

  //Tắt modal đi
  const handleCloseCommentModal = () => {
    dispatch(closeCommentModal());
    navigate(-1, { replace: true });
  };

  //   if (!post) return <div>Hehee</div>;
  if (!post || Object.keys(post).length === 0) return null;

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
export default CommentModalDeepLink;
