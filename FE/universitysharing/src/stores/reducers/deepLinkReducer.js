import { createSlice } from "@reduxjs/toolkit";
import { DeeplinkCommentModal } from "../action/deepLinkAction";

const deepLinkSlice = createSlice({
  name: "deeplink",
  initialState: {
    postsLink: {}, // Lưu dữ liệu bài viết
    isSelectPostOpen: null, // Lưu postId để mở modal
    loading: false,
    error: null,
  },
  reducers: {
    openModal(state, action) {
      state.isSelectPostOpen = action.payload; // Mở modal với postId
    },
    closeCommentModal(state) {
      state.isSelectPostOpen = null;
      state.postsLink = {};
    },
    clearDeeplink(state) {
      state.postsLink = {}; // 👈 Clear riêng chỉ postsLink
      state.isSelectPostOpen = null; // (Có thể giữ hoặc clear luôn, tùy bạn)
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(DeeplinkCommentModal.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(DeeplinkCommentModal.fulfilled, (state, action) => {
        state.loading = false;
        state.postsLink = action.payload.data; // Lưu bài viết
        state.isSelectPostOpen = action.payload.postId; // Tự động mở modal
        // console.error("DeeplinkCommentModal fulfilled, data:", {
        //   postId: action.payload.postId,
        //   postsLink: action.payload.data,
        //   isSelectPostOpen: state.isSelectPostOpen,
        // });
      })
      .addCase(DeeplinkCommentModal.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { openModal, closeCommentModal, clearDeeplink } =
  deepLinkSlice.actions;
export default deepLinkSlice.reducer;
