import { createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { setUserProfile } from "../reducers/proFileReducers";

// const token = localStorage.getItem("token");
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

export const userProfileDetail = createAsyncThunk(
  "profile/userProfileDetail",
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        "https://localhost:7053/api/UserProfile/profile-detail",
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

export const getPostOwner = createAsyncThunk(
  "profile/getPostOwner",
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        "https://localhost:7053/api/Post/GetPostsByOwner",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data.data.posts;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Có lỗi xảy ra!");
    }
  }
);

export const updateUserProfile = createAsyncThunk(
  "profile/updateUserProfile",
  async (formData, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.put(
        "https://localhost:7053/api/UserProfile/upProfile",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );
      return response.data;
    } catch (error) {
      // Trả về lỗi từ server nếu có
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchOtherUserProfile = createAsyncThunk(
  "profile/fetchOtherUserProfile",
  async (userId, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `https://localhost:7053/api/UserProfile/user-profile?userid=${userId}`,
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

export const fetchPostImagesPreview = createAsyncThunk(
  "profile/fetchPostImagesPreview",
  async (userId, { rejectWithValue }) => {
    try {
      if (!userId || userId === "undefined") {
        throw new Error("Invalid userId");
      }
      const token = localStorage.getItem("token");
      console.log("Fetching images for UserId:", userId);
      console.log("Token:", token);
      const response = await axios.get(
        `https://localhost:7053/api/UserProfile/post-images-preview?UserId=${userId}`, // Sửa endpoint
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log("API Response:", response.data);
      return response.data;
    } catch (error) {
      console.error("Error:", error.response?.data, error.response?.status);
      return rejectWithValue(
        error.response?.data?.message || error.message || "Có lỗi xảy ra!"
      );
    }
  }
);

export const fetchAllPostImages = createAsyncThunk(
  "profile/fetchAllPostImages",
  async (userId, { rejectWithValue }) => {
    try {
      if (!userId || userId === "undefined") {
        throw new Error("Invalid userId");
      }
      const token = localStorage.getItem("token");
      console.log("Fetching images for UserId:", userId);
      console.log("Token:", token);
      const response = await axios.get(
        `https://localhost:7053/api/UserProfile/post-images-all?UserId=${userId}`, // Sửa endpoint
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log("API Response:", response.data);
      return response.data;
    } catch (error) {
      console.error("Error:", error.response?.data, error.response?.status);
      return rejectWithValue(
        error.response?.data?.message || error.message || "Có lỗi xảy ra!"
      );
    }
  }
);
export const updateUserInformation = createAsyncThunk(
  "profile/updateUserInformation",
  async (data, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.put(
        "https://localhost:7053/api/UserProfile/upInformation",
        {
          Phone: data.phoneNumber,
          PhoneRelative: data.phoneRelative,
          Gender: data.gender,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);
export const fetchTrustScoreHistories = createAsyncThunk(
  "profile/fetchTrustScoreHistories",
  async (cursor = null, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        "https://localhost:7053/api/UserProfile/trust-score-histories",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          params: {
            cursor: cursor || undefined,
          },
        }
      );
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          "Có lỗi xảy ra khi lấy lịch sử điểm uy tín!"
      );
    }
  }
);
