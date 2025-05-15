import { createAsyncThunk } from "@reduxjs/toolkit";
import { jwtDecode } from "jwt-decode";
import { toast } from "react-toastify";
import axiosClient from "../../Service/axiosClient";
// Tạo bài đăng
export const createPost = createAsyncThunk(
  "ride/createPost",
  async (
    { content, startLocation, endLocation, startTime, postType },
    { rejectWithValue }
  ) => {
    try {
      const startTimeUtc = new Date(startTime).toISOString();
      console.log("startTimeUtc", startTimeUtc);
      const response = await axiosClient.post(
        "/api/ridepost/create",
        {
          content,
          startLocation,
          endLocation,
          startTime: startTimeUtc,
          postType,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
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

// Xóa bài viết
export const deleteRidePost = createAsyncThunk(
  "ride/deleteRidePost",
  async (postID, { rejectWithValue }) => {
    try {
      const response = await axiosClient.delete(
        `/api/ridepost/delete?PostId=${postID}`
      );
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

      const payload = {
        Id: postData.id,
        Content: postData.content || null,
        StartLocation: postData.startLocation || null,
        EndLocation: postData.endLocation || null,
        StartTime: postData.startTime || null,
      };

      console.log("Sending updatePost payload:", payload);
      const response = await axiosClient.put("/api/RidePost/update", payload, {
        headers: {
          "Content-Type": "application/json",
        },
      });

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
      const response = await axiosClient.get("/api/RidePost/get-all");
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
      const response = await axiosClient.post("/api/ride/create", rideData);
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

      const response = await axiosClient.get(`/api/ridepost/user/${userId}`, {
        params: {
          nextCursor: nextCursor || undefined,
          pageSize: pageSize || 10,
        },
      });
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
      const response = await axiosClient.patch(
        `/api/Ride/cancel-ride?RideId=${rideId}`,
        null
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

// Đánh giá tài xế
export const rateDriver = createAsyncThunk(
  "rides/rateDriver",
  async ({ rideId, driverId, rating, comment }, { rejectWithValue }) => {
    try {
      const response = await axiosClient.post("/api/ride/rate-driver", {
        rideId,
        driverId,
        rating,
        comment,
      });
      return { rideId, driverId, rating, comment };
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchCompletedRidesWithRating = createAsyncThunk(
  "ride/fetchCompletedRidesWithRating",
  async (userId, { rejectWithValue }) => {
    try {
      if (!userId) throw new Error("User ID is required");

      const token = localStorage.getItem("token");
      if (!token) throw new Error("No token found");

      const response = await axiosClient.get("/api/Ride/get-ride-rating", {
        params: { UserId: userId }, // Query parameter
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

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

// Fetch danh sách bài đăng
export const fetchLocation = createAsyncThunk(
  "ride/fetchLocation",
  async (rideId, { rejectWithValue }) => {
    try {
      const response = await axiosClient.get(
        `/api/UpdateLocation/get-all-by-ride-id?rideId=${rideId}`
      );
      return response.data?.data || []; // Trả về danh sách UpdateLocationDto
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.data || "Lỗi không xác định"
      );
    }
  }
);
