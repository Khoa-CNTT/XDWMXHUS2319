import { createSlice } from "@reduxjs/toolkit";
import { createPost, fetchRidePost, createRide, fetchPassengerRides, deletePost, updatePost } from "../../stores/action/ridePostAction";

const ridePostSlice = createSlice({
  name: "rides",
  initialState: {
    ridePosts: [],
    passengerRides: [],
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
      // fetchPassengerRides
      .addCase(fetchPassengerRides.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPassengerRides.fulfilled, (state, action) => {
        state.loading = false;
        state.passengerRides = action.payload;
      })
      .addCase(fetchPassengerRides.rejected, (state, action) => {
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