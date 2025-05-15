
import React, {
  createContext,
  useContext,
  useMemo,
  useState,
  useEffect,
} from "react";
import { jwtDecode } from "jwt-decode";


import {
  refreshAccessToken,
  validateToken,
} from "../../src/Service/authService";

import { useNavigate } from "react-router-dom";


const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [isLoading, setIsLoading] = useState(true);

  const [isTokenVerified, setIsTokenVerified] = useState(false);

  const [retryCount, setRetryCount] = useState(0);
  const maxRetries = 3;

  const authData = useMemo(() => {
    if (!token) {
      return { isAuthenticated: false, isLoading, isTokenVerified };
    }
    try {
      const decoded = jwtDecode(token);
      console.log("[AuthProvider] Decoded token:", decoded); // Log để kiểm tra
      const currentTime = Math.floor(Date.now() / 1000);
      if (decoded.exp < currentTime) {
        console.warn("[AuthProvider] Token đã hết hạn");
        localStorage.removeItem("token");
        setToken(null);
        return { isAuthenticated: false, isLoading, isTokenVerified };
      }
      return {
        isAuthenticated: true,
        token,
        userId:
          decoded[
            "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"
          ],
        userName:
          decoded["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"],
        userRole:
          decoded[
            "http://schemas.microsoft.com/ws/2008/06/identity/claims/role"
          ],
        exp: decoded["exp"],
        iss: decoded["iss"],
        aud: decoded["aud"],
        isLoading,
        isTokenVerified,
      };
    } catch (err) {
      console.error("[AuthProvider] Lỗi giải mã token:", err);
      return { isAuthenticated: false, isLoading, isTokenVerified };
    }
  }, [token, isLoading, isTokenVerified]);

  useEffect(() => {
    const verifyToken = async () => {
      setIsLoading(true);


      setIsTokenVerified(false);

      const storedToken = localStorage.getItem("token");
      if (storedToken && retryCount < maxRetries) {
        try {
          const isValid = await validateToken(storedToken);
          if (isValid) {
            setToken(storedToken);
            setIsTokenVerified(true);
            console.log("[AuthProvider] Token hợp lệ");
            setRetryCount(0);
            setIsTokenVerified(true); // Đánh dấu token đã được xác thực
          } else {
            console.warn("[AuthProvider] Token không hợp lệ, làm mới...");
            try {
              const newToken = await refreshAccessToken();
              setToken(newToken);
              setIsTokenVerified(true);
              setRetryCount(0);
              setIsTokenVerified(true);
            } catch (err) {
              console.error(
                "[AuthProvider] Không thể làm mới token:",
                err.message
              );
              setRetryCount((prev) => prev + 1);
              setTimeout(verifyToken, 5000);
              return;
            }
          }
        } catch (err) {
          console.error("[AuthProvider] Lỗi xác thực token:", err.message);
          setRetryCount((prev) => prev + 1);
          setTimeout(verifyToken, 5000);
          return;
        }
      } else {
        console.warn(
          "[AuthProvider] Đạt maxRetries hoặc không có token, xóa token"
        );
        localStorage.removeItem("token");
        setToken(null);
        setIsTokenVerified(true);
      }
      setIsLoading(false);
    };
    verifyToken();
  }, [retryCount]);

  useEffect(() => {
    if (!authData.isAuthenticated || !authData.exp) return;
    const refreshInterval = setInterval(async () => {
      const currentTime = Math.floor(Date.now() / 1000);
      const timeLeft = authData.exp - currentTime;
      if (timeLeft < 300) {
        try {
          console.log("[AuthProvider] Đang làm mới token...");
          const newToken = await refreshAccessToken();
          setToken(newToken);
          setIsTokenVerified(true);
        } catch (error) {
          console.error(
            "[AuthProvider] Không thể làm mới token:",
            error.message
          );
          setRetryCount((prev) => prev + 1);
        }
      }
    }, 60000);
    return () => clearInterval(refreshInterval);
  }, [authData.isAuthenticated, authData.exp]);

  const logout = () => {
    localStorage.removeItem("token");
    navigate("/login");
    setToken(null);
    setIsTokenVerified(false);
    console.log("[AuthProvider] Đã đăng xuất");
  };

  const login = (newToken) => {
    localStorage.setItem("token", newToken);
    setToken(newToken);

    setIsTokenVerified(true);

    console.log("[AuthProvider] Đã đăng nhập với token mới");
  };

  const value = {
    ...authData,
    login,
    logout,
    isTokenVerified, // Thêm vào context
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth phải được dùng trong AuthProvider");
  }
  return context;
};
