import { createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
export const userProfile = createAsyncThunk(
  "profile/userProfile",
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        "https://localhost:7053/api/UserProfile/profile",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Có lỗi xảy ra!");
    }
  }
);
