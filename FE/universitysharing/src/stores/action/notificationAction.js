// src/stores/action/notificationAction.js
import { createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

export const fetchNotifications = createAsyncThunk(
  "notifications/fetchNotifications",
  async (cursor, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      const baseURL = process.env.REACT_APP_BASE_URL;

      let url = `${baseURL}/api/Notification/get-all-notifications`;
      if (cursor) {
        url += `?Cursor=${cursor}`;
      }

      const response = await axios.get(url, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.data.success) {
        return rejectWithValue(response.data.message || "Lỗi không xác định");
      }

      return {
        notifications: response.data.data?.notifications || [],
        nextCursor: response.data.data?.nextCursor || null,
      };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          "Có lỗi xảy ra khi lấy danh sách thông báo"
      );
    }
  }
);

export const fetchNotificationsUnread = createAsyncThunk(
  "notifications/fetchNotificationsUnread",
  async (cursor, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      const baseURL = process.env.REACT_APP_BASE_URL;

      let url = `${baseURL}/api/Notification/get-notification-unread`;
      if (cursor) {
        url += `?Cursor=${cursor}`;
      }

      const response = await axios.get(url, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.data.success) {
        return rejectWithValue(response.data.message || "Lỗi không xác định");
      }

      return {
        notifications: response.data.data?.notifications || [],
        nextCursor: response.data.data?.nextCursor || null,
      };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          "Có lỗi xảy ra khi lấy danh sách thông báo"
      );
    }
  }
);

export const fetchNotificationsRead = createAsyncThunk(
  "notifications/fetchNotificationsRead",
  async (cursor, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      const baseURL = process.env.REACT_APP_BASE_URL;

      let url = `${baseURL}/api/Notification/get-notification-read`;
      if (cursor) {
        url += `?Cursor=${cursor}`;
      }

      const response = await axios.get(url, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.data.success) {
        return rejectWithValue(response.data.message || "Lỗi không xác định");
      }

      return {
        notifications: response.data.data?.notifications || [],
        nextCursor: response.data.data?.nextCursor || null,
      };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          "Có lỗi xảy ra khi lấy danh sách thông báo"
      );
    }
  }
);

export const markNotificationAsRead = createAsyncThunk(
  "notifications/markAsRead",
  async (notificationId, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      const baseURL = process.env.REACT_APP_BASE_URL;

      const response = await axios.patch(
        `${baseURL}/api/Notification/mark-as-read`,
        { NotificationId: notificationId },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.data.success) {
        return rejectWithValue(response.data.message || "Lỗi không xác định");
      }

      return notificationId; // Return the ID of the marked notification
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          "Có lỗi xảy ra khi đánh dấu thông báo đã đọc"
      );
    }
  }
);

// New action to fetch unread notification count
export const fetchUnreadNotificationCount = createAsyncThunk(
  "notifications/fetchUnreadNotificationCount",
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      const baseURL = process.env.REACT_APP_BASE_URL;
      const response = await axios.get(
        `${baseURL}/api/Notification/unread-count`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.data.success) {
        return rejectWithValue(
          response.data.message || "Failed to fetch unread notification count"
        );
      }

      return response.data.data; // Return the count (e.g., 0)
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          "Error fetching unread notification count"
      );
    }
  }
);

export const addRealTimeNotification = (notification) => ({
  type: "notifications/addRealTimeNotification",
  payload: notification,
});

export const markRealTimeAsRead = (notificationId) => ({
  type: "notifications/markRealTimeAsRead",
  payload: notificationId,
});
