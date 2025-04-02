import { createSlice } from "@reduxjs/toolkit";
import { createPost } from "../../stores/action/ridePostAction"; // Import action

const ridePostSlice = createSlice({
  name: "ridePosts",
  initialState: {
    ridePosts: [], // Lưu data của post vừa tạo
    loading: false,
    error: null,
    success: false, // Thêm flag để theo dõi trạng thái thành công
  },
  reducers: {
    // Có thể thêm reducer để reset state nếu cần
    resetPostState: (state) => {
      state.ridePosts = null;
      state.success = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createPost.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(createPost.fulfilled, (state, action) => {
        state.loading = false;
        state.ridePosts = action.payload.data; // Lưu data từ response
        state.success = action.payload.success; // Lưu trạng thái success
      })
      .addCase(createPost.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload; // Lưu message lỗi từ rejectWithValue
        state.success = false;
      });
  },
});

export const { resetPostState } = ridePostSlice.actions;
export default ridePostSlice.reducer;