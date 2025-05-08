// File: src/stores/action/authAction.js
import { createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../Service/axiosClient";

export const forgotPassword = createAsyncThunk(
  "auth/forgotPassword",
  async (email, { rejectWithValue }) => {
    try {
      console.log("Sending forgot password request for:", email);
      const response = await axiosInstance.post("/api/auth/forgot-password", {
        Email: email,
      });
      console.log("Response:", response.data);
      return response.data;
    } catch (error) {
      console.error("Error:", error.response?.data || error.message);
      return rejectWithValue(
        error.response?.data?.message || "Không thể gửi email khôi phục"
      );
    }
  }
);

export const resetPassword = createAsyncThunk(
  "auth/resetPassword",
  async ({ Token, NewPassword, ConfirmPassword }, { rejectWithValue }) => {
    try {
      console.log("Sending reset request with:", {
        Token,
        NewPassword,
        ConfirmPassword,
      });
      const response = await axiosInstance.post("/api/Auth/reset-password", {
        Token,
        NewPassword,
        ConfirmPassword,
      });
      console.log("Reset password response:", response.data);
      return response.data;
    } catch (error) {
      console.error("Reset password error:", {
        message: error.message,
        response: error.response?.data,
        config: error.config,
      });
      return rejectWithValue(
        error.response?.data?.message || "Không thể đặt lại mật khẩu"
      );
    }
  }
);

export const changePassword = createAsyncThunk(
  "auth/changePassword",
  async (
    { oldPassword, newPassword, confirmPassword },
    { rejectWithValue }
  ) => {
    try {
      const response = await axiosInstance.post("/api/auth/change-password", {
        oldPassword,
        newPassword,
        confirmPassword,
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Không thể đổi mật khẩu"
      );
    }
  }
);
