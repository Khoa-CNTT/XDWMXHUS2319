import React from "react";
import { userProfile } from "../stores/action/profileActions";
import CommentModal from "./CommentModal";
import CommentModalNoImg from "./CommentModal-NoImge/CommentNoImage";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { closeCommentModal } from "../stores/reducers/listPostReducers";
const CommentModalBackGround = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const post = useSelector((state) => state.posts.selectedPost);
  const usersState = useSelector((state) => state.users) || {};
  const { users } = usersState;

  //Tắt modal đi
  const handleCloseCommentModal = () => {
    dispatch(closeCommentModal());
    navigate(-1);
  };

  if (!post) return null;

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
