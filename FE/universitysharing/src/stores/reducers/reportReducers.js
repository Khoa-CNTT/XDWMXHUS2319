import { createSlice } from "@reduxjs/toolkit";
import { reportPost } from "../action/reportAction";

const reportSlice = createSlice({
  name: "report",
  initialState: {
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
      .addCase(reportPost.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(reportPost.fulfilled, (state) => {
        state.loading = false;
        state.success = true;
        state.error = null;
      })
      .addCase(reportPost.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      });
  },
});

export const { clearReportState } = reportSlice.actions;

export default reportSlice.reducer;
