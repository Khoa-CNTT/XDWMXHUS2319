import { createAsyncThunk } from "@reduxjs/toolkit";
import { Header } from "antd/es/layout/layout";
import axios from "axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export const DeeplinkCommentModal = createAsyncThunk(
  "deeplink/DeeplinkCommentModal",
  async (postId, { rejectWithValue }) => {
    const token = localStorage.getItem("token");
    try {
      const response = await axios.get(
        `https://localhost:7053/api/Post/get-by-id?id=${postId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      console.error("API trả về>>", response.data);
      return { postId, data: response.data.data };
    } catch (error) {
      return rejectWithValue(error.response?.data || "Có lỗi xảy ra");
    }
  }
);
