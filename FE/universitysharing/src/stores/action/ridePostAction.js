import { createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { toast } from "react-toastify";
import {jwtDecode} from "jwt-decode";
// Tạo bài đăng
export const createPost = createAsyncThunk(
  "ride/createPost",
  async ({content, startLocation, endLocation, startTime, postType }, { rejectWithValue }) => {
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
        { content,startLocation, endLocation, startTime, postType },
        config
      );
      toast.success(response.data.data.message || "Tạo bài đăng thành công!");
      console.log("response.data.data", response.data.data.message);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.data?.message || "Có lỗi xảy ra");
    }
  }
);

// Xóa bài đăng
export const deletePost = createAsyncThunk(
  "ride/deletePost",
  async (postId, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.delete(
        `https://localhost:7053/api/ridepost/${postId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      toast.success("Xóa bài đăng thành công!");
      return postId;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Lỗi khi xóa bài");
    }
  }
);

// Sửa bài đăng
export const updatePost = createAsyncThunk(
  "ride/updatePost",
  async ({ postId, startLocation, endLocation, startTime, postType }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.put(
        `https://localhost:7053/api/ridepost/${postId}`,
        { startLocation, endLocation, startTime, postType },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      toast.success("Cập nhật bài đăng thành công!");
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Lỗi khi sửa bài");
    }
  }
);

// Fetch danh sách bài đăng
export const fetchRidePost = createAsyncThunk(
  "ride/fetchRidePost",
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("https://localhost:7053/api/RidePost/get-all", {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data?.data?.responseRidePostDto || [];
    } catch (error) {
      return rejectWithValue(error.response?.data.data || "Lỗi không xác định");
    }
  }
);

// Tạo ride
export const createRide = createAsyncThunk(
  "ride/createRide",
  async (rideData, { rejectWithValue }) => {
    try {
      console.log("rideData", rideData);
      const token = localStorage.getItem("token");
      const response = await axios.post(
        "https://localhost:7053/api/ride/create",
        rideData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if(response.data.success) {
        toast.success(response.data.message || "Tạo chuyến đi thành công!");
      }else{
        toast.error(response.data.message || "Có lỗi xảy ra");
      }
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data.message || "Lỗi không xác định");
    }
  }
);

// Fetch rides theo userId từ API mới
export const fetchRidesByUserId = createAsyncThunk(
  "ride/fetchRidesByUserId",
  async ({ nextCursor, pageSize } = {}, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No token found");

      const decodedToken = jwtDecode(token);
      const userId = decodedToken["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"];

      const response = await axios.get(
        `https://localhost:7053/api/ridepost/user/${userId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
          params: {
            nextCursor: nextCursor || undefined,
            pageSize: pageSize || 10,
          },
        }
      );
      console.log("Current Ride:", response);
      return {
        driverRides: response.data.data.driverRideList,
        passengerRides: response.data.data.passengerRideList,
        driverNextCursor: response.data.data.driverNextCursor,
        passengerNextCursor: response.data.data.passengerNextCursor,
      };
    } catch (error) {
      return rejectWithValue(error.response?.data || "Lỗi không xác định");
    }
  }
);