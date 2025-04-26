import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  onlineStatus: {}, // { [userId]: boolean }
  loading: false,
  error: null,
};

const onlineUsersSlice = createSlice({
  name: "onlineUsers",
  initialState,
  reducers: {
    setOnlineStatus(state, action) {
      //state.onlineStatus = { ...state.onlineStatus, ...action.payload };
      state.onlineStatus = action.payload;
      state.loading = false;
      state.error = null;
    },
    setUserOnline(state, action) {
      state.onlineStatus[action.payload] = true;
    },
    setUserOffline(state, action) {
      state.onlineStatus[action.payload] = false;
    },
    setLoading(state) {
      state.loading = true;
    },
    setError(state, action) {
      state.loading = false;
      state.error = action.payload;
    },
    resetOnlineStatus(state) {
      state.onlineStatus = {};
      state.loading = false;
      state.error = null;
    },
  },
}); 

export const {
  setOnlineStatus,
  setUserOnline,
  setUserOffline,
  setLoading,
  setError,
  resetOnlineStatus,
} = onlineUsersSlice.actions;

export default onlineUsersSlice.reducer;