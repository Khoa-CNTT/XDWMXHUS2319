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
      console.log("Day la chep: ", response.data.data);
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
