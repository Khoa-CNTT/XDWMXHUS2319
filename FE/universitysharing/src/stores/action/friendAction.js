// src/stores/action/friendAction.js
import { createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

export const fetchFriends = createAsyncThunk(
  'friends/fetchFriends',
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get('https://localhost:7053/api/Message/friends', {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      // Kiểm tra nếu không thành công thì reject luôn
      if (!response.data.success) {
        return rejectWithValue(response.data.message || 'Lỗi không xác định');
      }

      return response.data.data; // Trả về danh sách bạn bè
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Có lỗi xảy ra khi lấy danh sách bạn bè');
    }
  }
);
