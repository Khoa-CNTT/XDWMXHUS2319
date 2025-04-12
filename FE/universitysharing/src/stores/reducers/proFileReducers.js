import { createSlice } from "@reduxjs/toolkit";
import {
  userProfile,
  getPostOwner,
  userProfileDetail,
  updateUserProfile,
} from "../action/profileActions";

const listUser = createSlice({
  name: "users",
  initialState: {
    users: {},
    usersDetail: {},
    usersProfile: {},
    post: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(userProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(userProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.users = action.payload;
        state.usersProfile = action.payload; // Cập nhật luôn profile chính
      })
      .addCase(userProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })

      .addCase(userProfileDetail.pending, (state) => {
        state.loading = true;
      })

      .addCase(userProfileDetail.fulfilled, (state, action) => {
        state.loading = false;
        state.usersDetail = action.payload;
        state.usersProfile = action.payload; // Cập nhật lại thông tin user sau khi làm mới
      })

      .addCase(userProfileDetail.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(getPostOwner.fulfilled, (state, action) => {
        state.post = action.payload;
      })

      .addCase(updateUserProfile.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateUserProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.usersProfile = { ...state.usersProfile, ...action.payload };
        state.usersDetail = { ...state.usersDetail, ...action.payload };
      })
      .addCase(updateUserProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload; // Xử lý lỗi
      });
  },
});
// export const { setUserProfile } = listUser.actions;
export default listUser.reducer;
