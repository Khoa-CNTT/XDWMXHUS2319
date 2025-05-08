import { createSlice } from "@reduxjs/toolkit";
import {
  fetchReportedPosts,
  deletePost,
  deleteAllReports,
  fetchPostsByAdmin,
  approvePost,
  adDeletePost,
  fetchUserUserReports,
} from "../action/adminActions";

const reporAdmintSlice = createSlice({
  name: "reportAdmintSlice",
  initialState: {
    posts: [],
    totalCount: 0,
    reportedPosts: [], // Thay đổi: Đổi reportPosts thành reportedPosts
    userUserReports: [], // Thêm state cho báo cáo người dùng
    loading: false,
    success: false,
    error: null,
  },
  reducers: {
    clearReportState: (state) => {
      state.success = false;
      state.error = null;
    },
    clearPostState: (state) => {
      state.success = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
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
      .addCase(fetchUserUserReports.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserUserReports.fulfilled, (state, action) => {
        state.loading = false;
        state.userUserReports = action.payload;
        state.success = true;
        state.error = null;
      })
      .addCase(fetchUserUserReports.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      })
      .addCase(deletePost.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deletePost.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.error = null;
        state.reportedPosts = state.reportedPosts.filter(
          (post) => post.id !== action.payload.postId
        );
      })
      .addCase(deletePost.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      })
      .addCase(deleteAllReports.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteAllReports.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.error = null;
        state.reportedPosts = state.reportedPosts.filter(
          (post) => post.id !== action.payload.postId
        );
      })
      .addCase(deleteAllReports.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      })
      // Xử lý fetchPostsByAdmin
      .addCase(fetchPostsByAdmin.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(fetchPostsByAdmin.fulfilled, (state, action) => {
        state.loading = false;
        state.posts = action.payload.posts;
        state.totalCount = action.payload.totalCount;
        state.success = true;
        state.error = null;
      })
      .addCase(fetchPostsByAdmin.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload.message;
        state.success = false;
      })
      // Xử lý approvePost
      .addCase(approvePost.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(approvePost.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.error = null;
        // Cập nhật trạng thái bài viết trong danh sách posts
        state.posts = state.posts.map((post) =>
          post.id === action.payload.postId
            ? { ...post, approvalStatus: 1 } // Chuyển sang Approved
            : post
        );
      })
      .addCase(approvePost.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      })
      // Xử lý adDeletePost
      .addCase(adDeletePost.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(adDeletePost.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.error = null;
        state.posts = state.posts.filter((post) => post.id !== action.payload);
        state.totalCount -= 1;
      })
      .addCase(adDeletePost.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload.message || "Không thể xóa bài viết";
        state.success = false;
      });
  },
});

export const { clearPostState } = reporAdmintSlice.actions;
export default reporAdmintSlice.reducer;
