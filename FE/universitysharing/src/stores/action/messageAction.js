import axios from "axios";

const API_URL = "https://localhost:7053/api/Message";

// Action types
const GET_CONVERSATION_SUCCESS = "GET_CONVERSATION_SUCCESS";
const GET_CONVERSATIONS_SUCCESS = "GET_CONVERSATIONS_SUCCESS";
const GET_MESSAGES_SUCCESS = "GET_MESSAGES_SUCCESS";
const SEND_MESSAGE_SUCCESS = "SEND_MESSAGE_SUCCESS";
const MARK_MESSAGE_SEEN_SUCCESS = "MARK_MESSAGE_SEEN_SUCCESS";
const REQUEST_FAILURE = "REQUEST_FAILURE";

const getToken = () => localStorage.getItem("token");

// Get single conversation
export const getConversation = (friendId) => async (dispatch) => {
  const token = getToken();
  if (!token) throw new Error("Không có token");

  try {
    const response = await axios.get(`${API_URL}/conversations/single?user2Id=${friendId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    dispatch({
      type: GET_CONVERSATION_SUCCESS,
      payload: response.data.data,
    });
    return response.data.data; // Trả về dữ liệu để dùng trong component
  } catch (error) {
    console.error("Lỗi khi lấy/tạo cuộc trò chuyện:", error);
    dispatch({
      type: REQUEST_FAILURE,
      payload: error.response?.data?.message || "Không thể lấy cuộc trò chuyện",
    });
    throw error;
  }
};

// Get all conversations
export const getConversations = () => async (dispatch) => {
  const token = getToken();
  if (!token) throw new Error("Không có token");

  try {
    const response = await axios.get(`${API_URL}/conversations`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    dispatch({
      type: GET_CONVERSATIONS_SUCCESS,
      payload: response.data.data,
    });
    return response.data.data;
  } catch (error) {
    console.error("Lỗi khi lấy danh sách cuộc trò chuyện:", error);
    dispatch({
      type: REQUEST_FAILURE,
      payload: error.response?.data?.message || "Không thể lấy danh sách cuộc trò chuyện",
    });
    throw error;
  }
};

// Get messages
export const getMessages = (conversationId, nextCursor = null, pageSize = 20) => async (dispatch) => {
  const token = getToken();
  if (!token) throw new Error("Không có token");

  try {
    const url = `${API_URL}/conversations/${conversationId}/messages?pageSize=${pageSize}${
      nextCursor ? `&nextCursor=${nextCursor}` : ""
    }`;
    const response = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    dispatch({
      type: GET_MESSAGES_SUCCESS,
      payload: response.data.data,
    });
    return response.data.data;
  } catch (error) {
    console.error("Lỗi khi lấy danh sách tin nhắn:", error);
    dispatch({
      type: REQUEST_FAILURE,
      payload: error.response?.data?.message || "Không thể lấy danh sách tin nhắn",
    });
    throw error;
  }
};

// Send message
export const sendMessage = (messageDto) => async (dispatch) => {
  const token = getToken();
  if (!token) throw new Error("Không có token");

  try {
    const response = await axios.post(`${API_URL}/send`, messageDto, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    console.log("API response from sendMessage:", response.data);
    dispatch({
      type: SEND_MESSAGE_SUCCESS,
      payload: response.data.data,
    });
    console.log("Tin nhắn đã được gửi thành công:", response.data.data);
    return response.data.data;
  } catch (error) {
    console.error("Lỗi khi gửi tin nhắn:", error);
    dispatch({
      type: REQUEST_FAILURE,
      payload: error.response?.data?.message || "Không thể gửi tin nhắn",
    });
    throw error;
  }
};

// Mark message as seen
export const markMessageAsSeen = (messageId, conversationId) => async (dispatch) => {
  const token = getToken();
  if (!token) throw new Error("Không có token");

  try {
    const response = await axios.patch(
      `${API_URL}/${messageId}/seen?conversationId=${conversationId}`,
      null,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    dispatch({
      type: MARK_MESSAGE_SEEN_SUCCESS,
      payload: response.data.data,
    });
    return response.data.data;
  } catch (error) {
    console.error("Lỗi khi đánh dấu tin nhắn đã đọc:", error);
    dispatch({
      type: REQUEST_FAILURE,
      payload: error.response?.data?.message || "Không thể đánh dấu tin nhắn đã đọc",
    });
    throw error;
  }
};