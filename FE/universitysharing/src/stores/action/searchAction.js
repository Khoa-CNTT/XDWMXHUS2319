import { createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import "react-toastify/dist/ReactToastify.css";

//search post
export const searchPost = createAsyncThunk(
  "searchs/searchPost",
  async (keyword, { rejectWithValue }) => {
    //  const token = localStorage.getItem("token");
    try {
      const response = await axios.get(
        `https://localhost:7053/api/Search?keyword=${keyword}`
        //   {
        //     headers: {
        //       Authorization: `Bearer ${token}`,
        //     },
        //   }
      );
      return { keyword, data: response.data.data.content }; // Trả về danh sách comments
    } catch (error) {
      return rejectWithValue(error.response?.data || "Lỗi không xác định");
    }
  }
);
