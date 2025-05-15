import { createSlice } from "@reduxjs/toolkit";
import {
  cancelRide,
  createPost,
  createRide,
  deleteRidePost,
  fetchCompletedRidesWithRating,
  fetchLocation,
  fetchRidePost,
  fetchRidesByUserId,
  rateDriver,
  updatePost
} from "../../stores/action/ridePostAction";

const ridePostSlice = createSlice({
  name: "rides",
  initialState: {
    ridePosts: [],
    driverRides: [],
    passengerRides: [],
    locations: [],
    driverNextCursor: null,
    passengerNextCursor: null,
    currentRide: null,
    ratedRides: [],
    completedRidesWithRating: [],
    loading: false,
    error: null,
    success: false,
    isRefreshing: false,
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
      .addCase(fetchRidePost.pending, (state) => {
        state.isRefreshing = true;
        state.error = null;
      })
      .addCase(fetchRidePost.fulfilled, (state, action) => {
        state.isRefreshing = false;
        state.ridePosts = action.payload;
      })
      .addCase(fetchRidePost.rejected, (state, action) => {
        state.isRefreshing = false;
        state.error = action.payload;
      })
      // deleteRidePost
      .addCase(deleteRidePost.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(deleteRidePost.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        // Filter out the deleted post from the ridePosts array
        state.ridePosts = state.ridePosts.filter(
          (post) => post.id !== action.payload
        );
      })
      .addCase(deleteRidePost.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      })
      // updatePost
      .addCase(updatePost.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(updatePost.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.error = null; // Clear error state on success
        if (action.payload && action.payload.id) {
          const index = state.ridePosts.findIndex(
            (post) => post.id === action.payload.id
          );
          if (index !== -1) {
            state.ridePosts[index] = {
              ...state.ridePosts[index],
              ...action.payload,
            };
          } else {
            console.warn(
              `Post with id ${action.payload.id} not found in ridePosts`
            );
          }
        }
        // Handle "No changes needed" case
        if (action.payload?.message === "No changes needed") {
          state.success = true; // Ensure success is set
        }
      })
      .addCase(updatePost.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
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
        state.currentRide = action.payload;
        state.success = true;
      })
      .addCase(createRide.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      })
      // cancelRide
      .addCase(cancelRide.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(cancelRide.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.driverRides = state.driverRides.filter(
          (ride) => ride.rideId !== action.payload
        );
        state.passengerRides = state.passengerRides.filter(
          (ride) => ride.rideId !== action.payload
        );
        state.currentRide = null; // Xóa currentRide nếu cần
      })
      .addCase(cancelRide.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      })
      .addCase(rateDriver.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(rateDriver.fulfilled, (state, action) => {
        state.loading = false;
        state.ratedRides.push({
          rideId: action.payload.rideId,
          driverId: action.payload.driverId,
          rating: action.payload.rating,
          comment: action.payload.comment,
        });
      })
      .addCase(rateDriver.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(fetchCompletedRidesWithRating.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCompletedRidesWithRating.fulfilled, (state, action) => {
        state.loading = false;
        state.completedRidesWithRating = action.payload;
      })
      .addCase(fetchCompletedRidesWithRating.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchLocation.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchLocation.fulfilled, (state, action) => {
        state.loading = false;
        state.locations = action.payload; // Lưu danh sách vị trí
      })
      .addCase(fetchLocation.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
      
  },
});

export const { resetPostState } = ridePostSlice.actions;
export default ridePostSlice.reducer;
