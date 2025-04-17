// src/stores/action/friendAction.js
import { createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

export const fetchFriends = createAsyncThunk(
  "friends/fetchFriends",
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        "https://localhost:7053/api/Message/friends",
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Kiểm tra nếu không thành công thì reject luôn
      if (!response.data.success) {
        return rejectWithValue(response.data.message || "Lỗi không xác định");
      }

      return response.data.data; // Trả về danh sách bạn bè
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          "Có lỗi xảy ra khi lấy danh sách bạn bè"
      );
    }
  }
);

export const fetchListFriend = createAsyncThunk(
  "friends/fetchListFriends",
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        "https://localhost:7053/api/FriendShip/get-friends-list",
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      return response.data.data; // Trả về danh sách bạn bè
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          "Có lỗi xảy ra khi lấy danh sách bạn bè"
      );
    }
  }
);

export const fetchFriendsByUserId = createAsyncThunk(
  "friends/fetchFriendsByUserId",
  async (userId, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `https://localhost:7053/api/FriendShip/get-list-friend?userId=${userId}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.data.success) {
        return rejectWithValue(response.data.message);
      }

      return response.data.data; // Trả về { countFriend, friends }
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          "Có lỗi xảy ra khi lấy danh sách bạn bè"
      );
    }
  }
);

export const fetchListFriendReceive = createAsyncThunk(
  "friends/fetchListFriendsReceive",
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        "https://localhost:7053/api/FriendShip/get-friends-received",
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      return response.data.data; // Trả về danh sách bạn bè
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          "Có lỗi xảy ra khi lấy danh sách bạn bè"
      );
    }
  }
);

export const sendFriendRequest = createAsyncThunk(
  "friends/sendFriendRequest",
  async (friendId, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        "https://localhost:7053/api/FriendShip/send-friend-request",
        { FriendId: friendId },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.data.success) {
        return rejectWithValue(response.data.message);
      }

      return { friendId, data: response.data.data };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Có lỗi xảy ra khi gửi lời mời kết bạn"
      );
    }
  }
);

// Trong friendAction.js
export const cancelFriendRequest = createAsyncThunk(
  "friends/cancelFriendRequest",
  async (friendId, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.delete(
        // Thay đổi từ POST sang DELETE
        "https://localhost:7053/api/FriendShip/cancel-friend-request",
        {
          data: { FriendId: friendId }, // DELETE cần data trong config
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const fetchSentFriendRequests = createAsyncThunk(
  "friends/fetchSentFriendRequests",
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        "https://localhost:7053/api/FriendShip/get-friends-sent",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Lỗi khi lấy danh sách lời mời đã gửi"
      );
    }
  }
);

// src/stores/action/friendAction.js
export const acceptFriendRequest = createAsyncThunk(
  "friends/acceptFriendRequest",
  async (friendId, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.patch(
        "https://localhost:7053/api/FriendShip/accept-friend-request",
        { FriendId: friendId },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.data.success) {
        return rejectWithValue(response.data.message);
      }

      return { friendId, data: response.data.data };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Có lỗi xảy ra khi chấp nhận lời mời"
      );
    }
  }
);

export const rejectFriendRequest = createAsyncThunk(
  "friends/rejectFriendRequest",
  async (friendId, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.patch(
        "https://localhost:7053/api/FriendShip/reject-friend-request",
        { FriendId: friendId },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.data.success) {
        return rejectWithValue(response.data.message);
      }

      return { friendId };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Có lỗi xảy ra khi từ chối lời mời"
      );
    }
  }
);

// src/stores/action/friendAction.js
export const removeFriend = createAsyncThunk(
  "friends/removeFriend",
  async (friendId, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.patch(
        "https://localhost:7053/api/FriendShip/remove-friend-request",
        { FriendId: friendId },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.data.success) {
        return rejectWithValue(response.data.message);
      }

      return { friendId };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Có lỗi xảy ra khi hủy kết bạn"
      );
    }
  }
);
