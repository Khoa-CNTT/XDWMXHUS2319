import { createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// const token = localStorage.getItem("token");

export const createPost = createAsyncThunk(
  "ride/createPost",
  async (
    { startLocation, endLocation, startTime, postType },
    { rejectWithValue }
  ) => {
    try {
      const token = localStorage.getItem("token");
      const config = {
        headers: {
          // "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      };

      const response = await axios.post(
        "https://localhost:7053/api/ridepost/create",
        {
          startLocation: startLocation,
          endLocation: endLocation,
          startTime: startTime,
          postType: postType,
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

export const fetchRidePost = createAsyncThunk(
  "ride/fetchRidePost",
  async (_, { rejectWithValue }) => {
    try {
      console.success("Đã gọi data");
      const token = localStorage.getItem("token");
      const response = await axios.get(
        "https://localhost:7053/api/RidePost/get-all",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      return response.data.data.responseRidePostDto; // Trả về dữ liệu cho Redux
    } catch (error) {
      return rejectWithValue(error.response?.data || "Lỗi không xác định");
    }
  }
);
