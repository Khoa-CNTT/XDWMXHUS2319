import { createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { toast } from "react-toastify";
import { jwtDecode } from "jwt-decode";
// Tạo bài đăng
export const createPost = createAsyncThunk(
  "ride/createPost",
  async (
    { content, startLocation, endLocation, startTime, postType },
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
        { content, startLocation, endLocation, startTime, postType },
        config
      );
      toast.success(response.data.data.message || "Tạo bài đăng thành công!");
      console.log("response.data.data", response.data.data.message);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.data?.message || "Có lỗi xảy ra"
      );
    }
  }
);

//Xóa bài viết
export const deleteRidePost = createAsyncThunk(
  "ride/deleteRidePost",
  async (postID, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.delete(
        `https://localhost:7053/api/ridepost/delete?PostId=${postID}`,
        {
          headers: {
            Authorization: `Bearer ${token}`, // Gửi token trong header
          },
        }
      );
      // console.log("Xóa bài viết thành công!", response.data);
      return postID;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Sửa bài đăng
export const updatePost = createAsyncThunk(
  "ride/updatePost",
  async (postData, { rejectWithValue }) => {
    try {
      if (!postData.id) throw new Error("Post ID is required");

      const token = localStorage.getItem("token");
      if (!token) throw new Error("No token found");

      const config = {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      };

      const payload = {
        Id: postData.id,
        Content: postData.content || null,
        StartLocation: postData.startLocation || null,
        EndLocation: postData.endLocation || null,
        StartTime: postData.startTime || null,
      };

      console.log("Sending updatePost payload:", payload);
      const response = await axios.put(
        "https://localhost:7053/api/RidePost/update",
        payload,
        config
      );

      console.log("updatePost response:", response.data);

      // Check for "No changes needed" and treat it as a success
      if (
        response.data.message &&
        response.data.message.includes("No changes needed")
      ) {
        return {
          ...response.data.data,
          message: "No changes needed",
        };
      }

      if (!response.data.success) {
        throw new Error(response.data.message || "Update failed");
      }

      return response.data.data;
    } catch (error) {
      const errorMessage =
        error.response?.data?.title ||
        error.response?.data?.message ||
        error.message ||
        "Lỗi khi cập nhật bài đăng";
      console.error("updatePost error:", errorMessage, error.response?.data);
      return rejectWithValue(errorMessage);
    }
  }
);

// Fetch danh sách bài đăng
export const fetchRidePost = createAsyncThunk(
  "ride/fetchRidePost",
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        "https://localhost:7053/api/RidePost/get-all",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
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
      if (response.data.success) {
        toast.success(response.data.message || "Tạo chuyến đi thành công!");
      } else {
        toast.error(response.data.message || "Có lỗi xảy ra");
      }
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data.message || "Lỗi không xác định"
      );
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
      const userId =
        decodedToken[
          "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"
        ];

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
// Hủy chuyến đi
export const cancelRide = createAsyncThunk(
  "ride/cancelRide",
  async (rideId, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      const config = {
        headers: { Authorization: `Bearer ${token}` },
      };
      const response = await axios.patch(
        `https://localhost:7053/api/Ride/cancel-ride?RideId=${rideId}`,
        null,
        config
      );
      if (response.data.success) {
        toast.success(response.data.message || "Hủy chuyến đi thành công!");
        return rideId;
      } else {
        throw new Error(response.data.message || "Hủy chuyến đi thất bại");
      }
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Lỗi khi hủy chuyến đi"
      );
    }
  }
);
export const rateDriver = createAsyncThunk(
  "rides/rateDriver",
  async ({ rideId, driverId, rating, comment }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        "https://localhost:7053/api/ride/rate-driver",
        { rideId, driverId, rating, comment },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      return { rideId, driverId, rating, comment };
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);
export const fetchCompletedRidesWithRating = createAsyncThunk(
  "ride/fetchCompletedRidesWithRating",
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No token found");

      const response = await axios.get(
        "https://localhost:7053/api/Ride/get-all-ride-rating",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.data.success) {
        throw new Error(response.data.message || "Failed to fetch rated rides");
      }

      return response.data.data || [];
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Lỗi khi lấy danh sách chuyến đi có đánh giá";
      toast.error(errorMessage);
      return rejectWithValue(errorMessage);
    }
  }
);
