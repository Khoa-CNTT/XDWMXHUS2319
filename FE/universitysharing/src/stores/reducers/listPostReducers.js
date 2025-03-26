import { createSlice } from "@reduxjs/toolkit";
import {
  addCommentPost,
  commentPost,
  fetchPosts,
  likePost,
} from "../action/listPostActions";

const listPostSlice = createSlice({
  name: "posts",
  initialState: {
    posts: [],
    comments: {},
    selectedPost: null,
    isShareModalOpen: false,
    selectedPostToShare: null,
    selectedPostToOption: null,
    isPostOptionsOpen: false, // 🆕 Thêm trạng thái modal options
  },
  reducers: {
    hidePost: (state, action) => {
      state.posts = state.posts.filter((post) => post.id !== action.payload);
    },
    openCommentModal: (state, action) => {
      state.selectedPost = action.payload;
    },
    closeCommentModal: (state) => {
      state.selectedPost = null;
    },
    openShareModal: (state, action) => {
      state.selectedPostToShare = action.payload;
      state.isShareModalOpen = true;
    },
    closeShareModal: (state) => {
      state.isShareModalOpen = false;
      state.selectedPostToShare = null;
    },
    openPostOptionModal: (state, action) => {
      state.selectedPostToOption = action.payload; // Lưu bài viết đang chọn
      state.isPostOptionsOpen = true; // Mở modal
    },
    closePostOptionModal: (state) => {
      state.isPostOptionsOpen = false;
      state.selectedPostToOption = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPosts.fulfilled, (state, action) => {
        state.posts = action.payload;
      })
      .addCase(likePost.fulfilled, (state, action) => {
        const postId = action.payload;
        state.posts = state.posts.map((post) =>
          post.id === postId
            ? {
                ...post,
                hasLiked: !post.hasLiked,
                likeCount: post.hasLiked
                  ? post.likeCount - 1
                  : post.likeCount + 1,
              }
            : post
        );
      })
      .addCase(commentPost.fulfilled, (state, action) => {
        const { postId, comments } = action.payload;
        state.comments[postId] = comments;
      })
      .addCase(addCommentPost.fulfilled, (state, action) => {
        console.log("🔥 Payload nhận được:", action.payload);
        const { postId, data } = action.payload;
        if (!postId || !data) return;

        const newComment = {
          id: data.commentId,
          userId: state.auth?.user?.id || "",
          userName: data.fullName,
          profilePicture: data.profilePicture,
          content: data.content,
          createdAt: data.createdAt,
          hasLiked: 0,
          likeCountComment: 0,
          replies: [],
          parentCommentId: null,
        };

        // 🛠 FIX: Nếu `state.comments[postId]` chưa tồn tại, khởi tạo nó là một mảng rỗng
        if (!Array.isArray(state.comments[postId])) {
          state.comments[postId] = [];
        }

        // Thêm comment mới vào mảng
        state.comments[postId].push(newComment);

        // Cập nhật số lượng bình luận trong bài post
        const postIndex = state.posts.findIndex((post) => post.id === postId);
        if (postIndex !== -1) {
          state.posts[postIndex].commentCount += 1;
        }
      });
  },
});

export const {
  hidePost,
  openCommentModal,
  closeCommentModal,
  openShareModal,
  closeShareModal,
  openPostOptionModal,
  closePostOptionModal,
} = listPostSlice.actions;

export default listPostSlice.reducer;
