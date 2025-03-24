import { createSlice } from "@reduxjs/toolkit";
import { commentPost, fetchPosts, likePost } from "../action/listPostActions";

const listPostSlice = createSlice({
  name: "posts",
  initialState: {
    posts: [],
    comments: {},
    selectedPost: null,
    isShareModalOpen: false,
    selectedPostToShare: null,
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
        state.comments[postId] = comments; // Giờ comments được lưu đúng cách
      });
  },
});

export const {
  hidePost,
  openCommentModal,
  closeCommentModal,
  openShareModal,
  closeShareModal,
} = listPostSlice.actions;

export default listPostSlice.reducer;
