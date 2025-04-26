import { createSlice } from "@reduxjs/toolkit";
import {
  fetchReportedPosts,
  deletePost,
  deleteAllReports,
} from "../action/adminActions";

const reporAdmintSlice = createSlice({
  name: "reportAdmintSlice",
  initialState: {
    reportedPosts: [], // Thay đổi: Đổi reportPosts thành reportedPosts
    loading: false,
    success: false,
    error: null,
  },
  reducers: {
    clearReportState: (state) => {
      state.success = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Xử lý fetchReportedPosts
    builder
      .addCase(fetchReportedPosts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchReportedPosts.fulfilled, (state, action) => {
        state.loading = false;
        state.reportedPosts = action.payload;
        state.success = true;
        state.error = null;
      })
      .addCase(fetchReportedPosts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      })
      // Xử lý deletePost
      .addCase(deletePost.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deletePost.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.error = null;
        // Xóa bài viết khỏi danh sách reportedPosts
        state.reportedPosts = state.reportedPosts.filter(
          (post) => post.id !== action.payload.postId // Sửa: Sử dụng action.payload.postId
        );
      })
      .addCase(deletePost.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      })
      // Xử lý deleteAllReports
      .addCase(deleteAllReports.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteAllReports.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.error = null;
        // Xóa bài viết khỏi danh sách reportedPosts vì không còn báo cáo
        state.reportedPosts = state.reportedPosts.filter(
          (post) => post.id !== action.payload.postId // Sửa: Sử dụng action.payload.postId
        );
      })
      .addCase(deleteAllReports.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      });
  },
});

export default reporAdmintSlice.reducer;
