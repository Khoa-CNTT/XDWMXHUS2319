// src/stores/reducers/friendReducer.js
import { createSlice } from '@reduxjs/toolkit';
import { fetchFriends } from '../action/friendAction';

const friendSlice = createSlice({
  name: 'friends',
  initialState: {
    friends: [],
    loading: false,
    error: null,
    activeFriend: null,
  },
  reducers: {
    setActiveFriend: (state, action) => {
      state.activeFriend = action.payload;
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
        state.friends = action.payload || [];
      })
      .addCase(fetchFriends.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Không thể lấy danh sách bạn bè';
      });
  },
});

export const { setActiveFriend } = friendSlice.actions;
export default friendSlice.reducer;
