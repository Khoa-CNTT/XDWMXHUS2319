// src/stores/reducers/friendReducer.js
import { createSlice } from "@reduxjs/toolkit";
import {
  fetchFriends,
  fetchListFriend,
  fetchFriendsByUserId,
  fetchListFriendReceive,
  sendFriendRequest,
  cancelFriendRequest,
  fetchSentFriendRequests,
  acceptFriendRequest,
  rejectFriendRequest,
  removeFriend,
} from "../action/friendAction";

const friendSlice = createSlice({
  name: "friends",
  initialState: {
    friends: [],
    countFriend: 0, // Add this to initialState
    loading: false,
    error: null,
    activeFriend: null,
    listFriends: [],
    listFriendsByUser: [],
    listFriendReceived: [],
    friendRequestStatus: {
      loading: false,
      error: null,
      success: false,
    },
    sentFriendRequests: [], // Thêm state mới
  },
  reducers: {
    setActiveFriend: (state, action) => {
      state.activeFriend = action.payload;
    },
    resetFriendRequestStatus: (state) => {
      state.friendRequestStatus = {
        loading: false,
        error: null,
        success: false,
      };
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchFriends.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFriends.fulfilled, (state, action) => {
        state.loading = false;
        state.friends = action.payload.friends || [];
      })
      .addCase(fetchFriends.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Không thể lấy danh sách bạn bè";
      })
      .addCase(fetchListFriend.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchListFriend.fulfilled, (state, action) => {
        state.loading = false;
        state.listFriends = action.payload || [];
      })
      .addCase(fetchListFriend.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Không thể lấy danh sách bạn bè";
      })
      .addCase(fetchFriendsByUserId.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFriendsByUserId.fulfilled, (state, action) => {
        state.loading = false;
        state.listFriendsByUser = action.payload || [];
      })
      .addCase(fetchFriendsByUserId.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Không thể lấy danh sách bạn bè";
      })
      .addCase(fetchListFriendReceive.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchListFriendReceive.fulfilled, (state, action) => {
        state.loading = false;
        state.listFriendReceived = action.payload || [];
      })
      .addCase(fetchListFriendReceive.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Không thể lấy danh sách bạn bè";
      })
      .addCase(sendFriendRequest.pending, (state) => {
        state.friendRequestStatus.loading = true;
        state.friendRequestStatus.error = null;
        state.friendRequestStatus.success = false;
      })
      .addCase(sendFriendRequest.fulfilled, (state, action) => {
        state.friendRequestStatus.loading = false;
        state.friendRequestStatus.success = true;
        // Update listFriendReceived if needed
        if (state.listFriendReceived) {
          state.listFriendReceived = state.listFriendReceived.filter(
            (request) => request.friendId !== action.payload.friendId
          );
        }
      })
      .addCase(sendFriendRequest.rejected, (state, action) => {
        state.friendRequestStatus.loading = false;
        state.friendRequestStatus.error = action.payload;
      })
      .addCase(cancelFriendRequest.pending, (state) => {
        state.friendRequestStatus.loading = true;
        state.friendRequestStatus.error = null;
        state.friendRequestStatus.success = false;
      })
      .addCase(cancelFriendRequest.fulfilled, (state, action) => {
        state.friendRequestStatus.loading = false;
        state.friendRequestStatus.success = true;
        // Update listFriendReceived if needed
        if (state.listFriendReceived) {
          state.listFriendReceived = state.listFriendReceived.filter(
            (request) => request.friendId !== action.payload.friendId
          );
        }
      })
      .addCase(cancelFriendRequest.rejected, (state, action) => {
        state.friendRequestStatus.loading = false;
        state.friendRequestStatus.error = action.payload;
      })
      .addCase(fetchSentFriendRequests.fulfilled, (state, action) => {
        state.sentFriendRequests = action.payload || [];
      })
      // Xử lý chấp nhận lời mời
      .addCase(acceptFriendRequest.pending, (state) => {
        state.friendRequestStatus.loading = true;
        state.friendRequestStatus.error = null;
      })
      .addCase(acceptFriendRequest.fulfilled, (state, action) => {
        state.friendRequestStatus.loading = false;
        state.friendRequestStatus.success = true;

        // Cập nhật danh sách bạn bè
        if (state.listFriendReceived) {
          state.listFriendReceived = state.listFriendReceived.filter(
            (request) => request.friendId !== action.payload.friendId
          );
        }
      })
      .addCase(acceptFriendRequest.rejected, (state, action) => {
        state.friendRequestStatus.loading = false;
        state.friendRequestStatus.error = action.payload;
      })

      // Xử lý từ chối lời mời
      .addCase(rejectFriendRequest.pending, (state) => {
        state.friendRequestStatus.loading = true;
        state.friendRequestStatus.error = null;
      })
      .addCase(rejectFriendRequest.fulfilled, (state, action) => {
        state.friendRequestStatus.loading = false;
        state.friendRequestStatus.success = true;

        // Loại bỏ lời mời đã từ chối khỏi danh sách
        if (state.listFriendReceived) {
          state.listFriendReceived = state.listFriendReceived.filter(
            (request) => request.friendId !== action.payload.friendId
          );
        }
      })
      .addCase(rejectFriendRequest.rejected, (state, action) => {
        state.friendRequestStatus.loading = false;
        state.friendRequestStatus.error = action.payload;
      })
      .addCase(removeFriend.pending, (state) => {
        state.friendRequestStatus.loading = true;
        state.friendRequestStatus.error = null;
        state.friendRequestStatus.success = false;
      })
      .addCase(removeFriend.fulfilled, (state, action) => {
        state.friendRequestStatus.loading = false;
        state.friendRequestStatus.success = true;

        // Cập nhật danh sách bạn bè - thêm kiểm tra Array.isArray
        if (Array.isArray(state.listFriends)) {
          state.listFriends = state.listFriends.filter(
            (friend) => friend.friendId !== action.payload.friendId
          );
        }

        // Cập nhật danh sách bạn bè theo user
        if (Array.isArray(state.listFriendsByUser)) {
          state.listFriendsByUser = state.listFriendsByUser.filter(
            (friend) => friend.friendId !== action.payload.friendId
          );
        }
      })
      .addCase(removeFriend.rejected, (state, action) => {
        state.friendRequestStatus.loading = false;
        state.friendRequestStatus.error = action.payload;
        state.friendRequestStatus.success = false;
      });
  },
});

export const { setActiveFriend, resetFriendRequestStatus } =
  friendSlice.actions;
export default friendSlice.reducer;
