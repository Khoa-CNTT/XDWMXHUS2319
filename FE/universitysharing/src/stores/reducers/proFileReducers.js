import { createSlice } from "@reduxjs/toolkit";
import {
  userProfile,
  getPostOwner,
  userProfileDetail,
  updateUserProfile,
  fetchOtherUserProfile,
  fetchPostImagesPreview,
  fetchAllPostImages,
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
    otherUser: {},
    postImages: [],
    allPostImages: [],
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
      })
      .addCase(fetchOtherUserProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.otherUser = action.payload; // Store the other user's data in users
      })
      // Thêm các case cho fetchPostImagesPreview
      .addCase(fetchPostImagesPreview.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPostImagesPreview.fulfilled, (state, action) => {
        state.loading = false;
        state.postImages = action.payload; // Lưu danh sách ảnh
      })
      .addCase(fetchPostImagesPreview.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchAllPostImages.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllPostImages.fulfilled, (state, action) => {
        state.loading = false;
        state.allPostImages = action.payload; // Lưu danh sách ảnh
      })
      .addCase(fetchAllPostImages.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});
// export const { setUserProfile } = listUser.actions;
export default listUser.reducer;
