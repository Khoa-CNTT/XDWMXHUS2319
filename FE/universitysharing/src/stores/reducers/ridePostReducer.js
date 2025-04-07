import { createSlice } from "@reduxjs/toolkit";
import { createPost, fetchRidePost, createRide, deletePost, updatePost,fetchRidesByUserId } from "../../stores/action/ridePostAction";

const ridePostSlice = createSlice({
  name: "rides",
  initialState: {
    ridePosts: [],
    driverRides: [], // Đảm bảo là mảng rỗng
    passengerRides: [], // Đảm bảo là mảng rỗng
    driverNextCursor: null,
    passengerNextCursor: null,
    currentRide: null,
    loading: false,
    error: null,
    success: false,
  },
  reducers: {
    resetPostState: (state) => {
      state.currentRide = null;
      state.success = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // createPost
      .addCase(createPost.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(createPost.fulfilled, (state, action) => {
        state.loading = false;
        state.ridePosts.unshift(action.payload);
        state.success = true;
      })
      .addCase(createPost.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      })
      // fetchRidePost
      .addCase(fetchRidePost.fulfilled, (state, action) => {
        state.loading = false;
        state.ridePosts = action.payload;
      })
      // deletePost
      .addCase(deletePost.fulfilled, (state, action) => {
        state.ridePosts = state.ridePosts.filter(post => post.id !== action.payload);
      })
      // updatePost
      .addCase(updatePost.fulfilled, (state, action) => {
        const index = state.ridePosts.findIndex(post => post.id === action.payload.id);
        if (index !== -1) state.ridePosts[index] = action.payload;
      })
      
      // fetchRidesByUserId
      .addCase(fetchRidesByUserId.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRidesByUserId.fulfilled, (state, action) => {
        state.loading = false;
        state.driverRides = action.payload.driverRides;
        state.passengerRides = action.payload.passengerRides;
        state.driverNextCursor = action.payload.driverNextCursor;
        state.passengerNextCursor = action.payload.passengerNextCursor;
      })
      .addCase(fetchRidesByUserId.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // createRide
      .addCase(createRide.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(createRide.fulfilled, (state, action) => {
        state.loading = false;
        state.currentRide = action.payload; // Cập nhật currentRide
        state.success = true; // Cập nhật success
      })
      .addCase(createRide.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      });
  },
});

export const { resetPostState } = ridePostSlice.actions;
export default ridePostSlice.reducer;