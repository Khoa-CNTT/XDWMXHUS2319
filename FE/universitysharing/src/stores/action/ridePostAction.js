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
          "Content-Type": "application/json",
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
      console.log(error.response?.data?.message);
      return rejectWithValue(errorMessage);
    }
  }
);

export const fetchRidePost = createAsyncThunk(
  "ride/fetchRidePost",
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        return rejectWithValue("Token không tồn tại hoặc chưa đăng nhập");
      }

      const response = await axios.get(
        "https://localhost:7053/api/RidePost/get-all",
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      return response.data?.data?.responseRidePostDto || [];
    } catch (error) {
      console.error("Lỗi API:", error);
      return rejectWithValue(
        error.response?.data || error.message || "Lỗi không xác định"
      );
    }
  }
);
// Action để tạo ride
export const createRide = createAsyncThunk(
  "ride/createRide",
  async (rideData, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token"); // Giả sử token lưu trong localStorage
      const response = await axios.post(
        "https://localhost:7053/api/ride/create",
        rideData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      return response.data.data; // Trả về dữ liệu từ response
    } catch (error) {
      return rejectWithValue(error.response?.data || "Lỗi không xác định");
    }
  }
);
// Lấy danh sách ride của khách hàng
export const fetchPassengerRides = createAsyncThunk(
  "ride/fetchPassengerRides",
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        "https://localhost:7053/api/ridepost/passenger",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      return response.data.data.rideList; // Lấy rideList thay vì responseRidePostDto
    } catch (error) {
      return rejectWithValue(error.response?.data || "Lỗi không xác định");
    }
  }
);
