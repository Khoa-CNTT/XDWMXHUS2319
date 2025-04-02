import { createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const token = localStorage.getItem("token");

export const createPost = createAsyncThunk(
  "ride/createPost",
  async (
    { content, startLocation, endLocation, startTime, postType },
    { rejectWithValue }
  ) => {
    try {
    } catch (error) {
      return rejectWithValue(error.response?.data || "Có lỗi xảy ra");
    }
  }
);
