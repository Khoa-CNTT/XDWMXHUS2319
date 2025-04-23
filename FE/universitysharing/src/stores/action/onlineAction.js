import { createAsyncThunk } from "@reduxjs/toolkit";
import axiosClient from "../../Service/axiosClient";
import { setOnlineStatus, setLoading, setError } from "../reducers/onlineSlice";
export const checkOnlineUsers = createAsyncThunk(
  "onlineUsers/checkOnlineUsers",
  async (userIds, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading());
      const response = await axiosClient.post(
        "/api/online/check-online",
        userIds
      );
      const onlineStatus = response.data.data; // { "user1": true, "user2": false }
      dispatch(setOnlineStatus(onlineStatus));
      return onlineStatus;
    } catch (err) {
      const errorMessage = err.response?.data?.message || "Lỗi kiểm tra trạng thái online";
      dispatch(setError(errorMessage));
      return rejectWithValue(errorMessage);
    }
  }
);