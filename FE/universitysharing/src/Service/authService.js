import axiosClient from "./axiosClient";

export const getAccessToken = () => localStorage.getItem("token");

export const setAccessToken = (token) => {
  localStorage.setItem("token", token);
};

export const removeAccessToken = () => {
  localStorage.removeItem("token");
};

export const refreshAccessToken = async () => {
  try {
    const res = await axiosClient.post("/api/auth/refresh-token");
    // Sửa: Lấy accessToken từ response
    const newToken = res.data.accessToken;
    if (!newToken) {
      throw new Error("Invalid refresh token response");
    }
    setAccessToken(newToken);
    return newToken;
  } catch (error) {
    console.error("[authService] Lỗi khi làm mới token:", error.message);
    throw error;
  }
};

// Sửa: Thêm validateToken
export const validateToken = async (token) => {
  try {
    const res = await axiosClient.get("/api/auth/validate-token", {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data.success === true;
  } catch (error) {
    console.error("[authService] Lỗi xác thực token:", error.message);
    return false;
  }
};