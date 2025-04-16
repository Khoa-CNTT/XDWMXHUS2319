import axios from "axios";
import { getAccessToken, setAccessToken, removeAccessToken, refreshAccessToken } from "./authService";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useEffect, useRef } from "react";

const useAxiosConfig = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  return { navigate, logout };
};

let axiosConfig = null;

export const AxiosConfigProvider = () => {
  const { navigate, logout } = useAxiosConfig();
  const isMounted = useRef(false);
  useEffect(() => {
    if (!isMounted.current) {
      axiosConfig = { navigate, logout };
      isMounted.current = true;
    }
  }, [navigate, logout]);
  return null;
};

const axiosClient = axios.create({
  baseURL: process.env.REACT_APP_BASE_URL,
  withCredentials: true,
});

axiosClient.interceptors.request.use(
  (config) => {
    const token = getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

axiosClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return axiosClient(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }
      originalRequest._retry = true;
      isRefreshing = true;
      try {
        const newToken = await refreshAccessToken();
        setAccessToken(newToken);
        processQueue(null, newToken);
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return axiosClient(originalRequest);
      } catch (err) {
        console.error("[axiosClient] Không thể làm mới token:", err.message);
        processQueue(err, null);
        // Sửa: Chỉ đăng xuất nếu lỗi rõ ràng là refresh token hết hạn
        if (err.response?.status === 401 && err.response?.data?.message === "Refresh token is invalid or expired") {
          if (axiosConfig) {
            axiosConfig.logout();
            axiosConfig.navigate("/login", { replace: true });
          } else {
            removeAccessToken();
            window.location.href = "/login";
          }
        }
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }
    return Promise.reject(error);
  }
);

export default axiosClient;