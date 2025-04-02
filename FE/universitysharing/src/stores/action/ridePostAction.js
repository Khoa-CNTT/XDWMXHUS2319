import { createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const token = localStorage.getItem("token");

export const createPost = createAsyncThunk(
  "ride/createPost",
  async (
    { startLocation, endLocation, startTime, postType },
    { rejectWithValue }
  ) => {
    try {
      const config = {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      };

      const response = await axios.post(
        "https://localhost:7053/api/ridepost/create",
        {
          startLocation,
          endLocation,
          startTime,
          postType,
        },
        config
      );

      toast.success(response.data.message || "Tạo bài đăng thành công!");
      return response.data.data; // Trả về toàn bộ response để reducer xử lý
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Có lỗi xảy ra";
      toast.error(errorMessage);
      return rejectWithValue(errorMessage);
    }
  }
);