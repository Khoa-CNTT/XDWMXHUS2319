import { createSlice } from "@reduxjs/toolkit";
import {
  fetchReportedPosts,
  deletePost,
  deleteAllReports,
  fetchUserUserReports,
} from "../action/adminActions";

const reportAdminSlice = createSlice({
  name: "reportAdmintSlice",
  initialState: {
    reportedPosts: [],
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
      });
  },
});

export const { clearReportState } = reportAdminSlice.actions;
export default reportAdminSlice.reducer;
