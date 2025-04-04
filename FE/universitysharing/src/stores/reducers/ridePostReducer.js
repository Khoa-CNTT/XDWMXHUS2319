import { createSlice } from "@reduxjs/toolkit";
import {
  createPost,
  fetchRidePost,
  createRide,
  fetchPassengerRides,
} from "../../stores/action/ridePostAction";

const ridePostSlice = createSlice({
  name: "rides",
  initialState: {
    ridePosts: [],
    passengerRides: [], // Danh sách ride của khách hàng (rideList)
    currentRide: null,
    loading: false,
    error: null,
    success: false,
  },
  reducers: {
    resetPostState: (state) => {
      state.ridePosts = [];
      state.passengerRides = [];
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
        state.ridePosts.push(action.payload.data);
        console.log(">>", action.payload.data);
        state.success = true;
      })
      .addCase(createPost.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      })
      // fetchRidePost
      .addCase(fetchRidePost.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRidePost.fulfilled, (state, action) => {
        state.loading = false;
        state.ridePosts = action.payload;
      })
      .addCase(fetchRidePost.rejected, (state, action) => {
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
        state.currentRide = action.payload;
        state.success = true;
      })
      .addCase(createRide.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      })
      // fetchPassengerRides
      .addCase(fetchPassengerRides.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPassengerRides.fulfilled, (state, action) => {
        state.loading = false;
        state.passengerRides = action.payload; // Lưu rideList vào passengerRides
      })
      .addCase(fetchPassengerRides.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { resetPostState } = ridePostSlice.actions;
export default ridePostSlice.reducer;
