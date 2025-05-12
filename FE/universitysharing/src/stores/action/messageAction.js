// src/stores/action/messageAction.js
import { createAsyncThunk } from "@reduxjs/toolkit";
import axiosClient from "../../Service/axiosClient";

// Action types
const GET_CONVERSATION_SUCCESS = "GET_CONVERSATION_SUCCESS";
const GET_CONVERSATIONS_SUCCESS = "GET_CONVERSATIONS_SUCCESS";
const GET_MESSAGES_SUCCESS = "GET_MESSAGES_SUCCESS";
const SEND_MESSAGE_SUCCESS = "SEND_MESSAGE_SUCCESS";
const MARK_MESSAGE_SEEN_SUCCESS = "MARK_MESSAGE_SEEN_SUCCESS";
const REQUEST_FAILURE = "REQUEST_FAILURE";

// Get single conversation
export const getConversation = (friendId, token) => async (dispatch) => {
  if (!token) {
    const error = new Error("Không có token");
    dispatch({
      type: REQUEST_FAILURE,
      payload: "Vui lòng đăng nhập lại",
    });
    throw error;
  }

  try {
    const response = await axiosClient.get(
      `api/Message/conversations/single?user2Id=${friendId}`
    );
    const data = response.data.data || response.data; // Linh hoạt với định dạng
    if (!data?.id) {
      throw new Error("Không nhận được conversation ID từ API");
    }
    dispatch({
      type: GET_CONVERSATION_SUCCESS,
      payload: data,
    });
    // console.error("[getConversation] Thành công:", data);
    return data;
  } catch (error) {
    console.error("[getConversation] Lỗi:", {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      friendId,
    });
    const message =
      error.response?.data?.message ||
      "Không thể lấy cuộc trò chuyện. Vui lòng thử lại.";
    dispatch({
      type: REQUEST_FAILURE,
      payload: message,
    });
    throw new Error(message);
  }
};

// Get all conversations hàm này không sài chả biết nó trả về cái gì
export const getConversations = (token) => async (dispatch) => {
  if (!token) {
    const error = new Error("Không có token");
    dispatch({
      type: REQUEST_FAILURE,
      payload: "Vui lòng đăng nhập lại",
    });
    throw error;
  }

  try {
    const response = await axiosClient.get("api/Message/conversations");
    const data = response.data.data || response.data; // Linh hoạt với định dạng
    dispatch({
      type: GET_CONVERSATIONS_SUCCESS,
      payload: data,
    });
    console.log("[getConversations] Thành công:", data);
    return data;
  } catch (error) {
    console.error("[getConversations] Lỗi:", {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
    });
    const message =
      error.response?.data?.message ||
      "Không thể lấy danh sách cuộc trò chuyện. Vui lòng thử lại.";
    dispatch({
      type: REQUEST_FAILURE,
      payload: message,
    });
    throw new Error(message);
  }
};

// Get messages
export const getMessages =
  (conversationId, nextCursor = null, pageSize = 20, token) =>
  async (dispatch) => {
    if (!token) {
      const error = new Error("Không có token");
      dispatch({
        type: REQUEST_FAILURE,
        payload: "Vui lòng đăng nhập lại",
      });
      throw error;
    }
    console.error("conversationId >>>", conversationId);
    try {
      const url = `api/Message/conversations/${conversationId}/messages?pageSize=${pageSize}${
        nextCursor ? `&nextCursor=${nextCursor}` : ""
      }`;
      const response = await axiosClient.get(url);
      const data = response.data.data || response.data; // Linh hoạt với định dạng
      dispatch({
        type: GET_MESSAGES_SUCCESS,
        payload: data,
      });
      console.error("[getMessages] Thành công:", data);
      return data;
    } catch (error) {
      console.error("[getMessages] Lỗi:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        conversationId,
      });
      const message =
        error.response?.data?.message ||
        "Không thể lấy danh sách tin nhắn. Vui lòng thử lại.";
      dispatch({
        type: REQUEST_FAILURE,
        payload: message,
      });
      throw new Error(message);
    }
  };

// Send message
export const sendMessage = (messageDto, token) => async (dispatch) => {
  if (!token) {
    const error = new Error("Không có token");
    dispatch({
      type: REQUEST_FAILURE,
      payload: "Vui lòng đăng nhập lại",
    });
    throw error;
  }

  try {
    const response = await axiosClient.post("api/Message/send", messageDto);
    const data = response.data.data || response.data; // Linh hoạt với định dạng
    dispatch({
      type: SEND_MESSAGE_SUCCESS,
      payload: data,
    });
    // console.error("[sendMessage] Thành công:", data);
    return data;
  } catch (error) {
    console.error("[sendMessage] Lỗi:", {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
    });
    const message =
      error.response?.data?.message ||
      "Không thể gửi tin nhắn. Vui lòng thử lại.";
    dispatch({
      type: REQUEST_FAILURE,
      payload: message,
    });
    throw new Error(message);
  }
};

//Làm để tương tác với reducer
//này cho createThunk để dùng cho reducer

// Lấy thông tin người dùng đã inbox với mình
export const getInbox = createAsyncThunk(
  "messenger/getInbox",
  async ({ pageSize = 20, token }, { rejectWithValue }) => {
    if (!token) {
      return rejectWithValue("Thiếu token");
    }

    try {
      const response = await axiosClient.get("api/Message/inbox", {
        params: { pageSize },
        headers: { Authorization: `Bearer ${token}` },
      });

      const { data } = response.data;

      const uniqueConversations = Array.from(
        new Map(data.inBox.map((conv) => [conv.conversationId, conv])).values()
      );

      const initialUnreadCounts = {};
      uniqueConversations.forEach((conv) => {
        if (conv.unreadCount > 0) {
          initialUnreadCounts[conv.user.id] = conv.unreadCount;
        }
      });

      // console.error("Hội thoại >>", uniqueConversations);
      // console.error("Hội chưa đọc >>", initialUnreadCounts);
      return {
        conversations: uniqueConversations,
        unreadCounts: initialUnreadCounts,
      };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Không thể lấy danh sách hội thoại"
      );
    }
  }
);

//Lấy tin nhắn của các nhân
export const getMessagess = createAsyncThunk(
  "messenger/getMessages",
  async (
    { conversationId, nextCursor, pageSize = 20, token, append = false },
    thunkAPI
  ) => {
    try {
      const url = `api/Message/conversations/${conversationId}/messages?pageSize=${pageSize}${
        nextCursor ? `&nextCursor=${nextCursor}` : ""
      }`;
      const response = await axiosClient.get(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // console.warn("Data trả về >>", response.data.data);
      return {
        data: response.data.data.messages || [],
        nextCursor: response.data.data.nextCursor || null,
        append,
      };
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Không thể lấy tin nhắn"
      );
    }
  }
);

// Thunk lấy cuộc trò chuyện
export const getConversationss = createAsyncThunk(
  "conversation/getSingle",
  async ({ friendId, token }, { rejectWithValue }) => {
    if (!token) {
      return rejectWithValue("Vui lòng đăng nhập lại");
    }

    try {
      const response = await axiosClient.get(
        `api/Message/conversations/single?user2Id=${friendId}`
      );
      const data = response.data.data || response.data;

      if (!data?.id) {
        throw new Error("Không nhận được conversation ID từ API");
      }

      // console.log("[getConversation] Thành công:", data);
      return data;
    } catch (error) {
      console.error("[getConversation] Lỗi:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        friendId,
      });

      const message =
        error.response?.data?.message ||
        "Không thể lấy cuộc trò chuyện. Vui lòng thử lại.";

      return rejectWithValue(message);
    }
  }
);

//Sendmess sài createAsyncThunk
export const sendMessages = createAsyncThunk(
  "message/sendMessage",
  async ({ messageDto, token }, { rejectWithValue }) => {
    console.error("Hàm được thiết lập");
    if (!token) {
      return rejectWithValue("Vui lòng đăng nhập lại");
    }

    try {
      const response = await axiosClient.post("api/Message/send", messageDto);
      const data = response.data.data || response.data;
      // console.error("[sendMessage] Thành công 🥰:", data);
      return data;
    } catch (error) {
      console.error("[sendMessage] Lỗi:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });

      const message =
        error.response?.data?.message ||
        "Không thể gửi tin nhắn. Vui lòng thử lại.";
      return rejectWithValue(message);
    }
  }
);
