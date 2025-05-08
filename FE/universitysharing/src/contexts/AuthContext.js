import React, { createContext, useContext, useMemo, useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import { refreshAccessToken, validateToken } from "../../src/Service/authService";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [isLoading, setIsLoading] = useState(true);
  const [retryCount, setRetryCount] = useState(0);
  const maxRetries = 3;

  const authData = useMemo(() => {
    if (!token) {
      return { isAuthenticated: false, isLoading };
    }
    try {
      const decoded = jwtDecode(token);
      const currentTime = Math.floor(Date.now() / 1000);
      if (decoded.exp < currentTime) {
        console.warn("[AuthProvider] Token đã hết hạn");
        localStorage.removeItem("token");
        setToken(null);
        return { isAuthenticated: false, isLoading };
      }
      return {
        isAuthenticated: true,
        token,
        userId: decoded["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"],
        userName: decoded["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"],
        userRole: decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"],
        exp: decoded["exp"],
        iss: decoded["iss"],
        aud: decoded["aud"],
        isLoading,
      };
    } catch (err) {
      console.error("[AuthProvider] Lỗi giải mã token:", err);
      return { isAuthenticated: false, isLoading };
    }
  }, [token, isLoading]);

  useEffect(() => {
    const verifyToken = async () => {
      setIsLoading(true);
      const storedToken = localStorage.getItem("token");
      if (storedToken && retryCount < maxRetries) {
        try {
          const isValid = await validateToken(storedToken);
          if (isValid) {
            setToken(storedToken);
            console.log("[AuthProvider] Token hợp lệ");
            setRetryCount(0);
          } else {
            console.warn("[AuthProvider] Token không hợp lệ, làm mới...");
            try {
              const newToken = await refreshAccessToken();
              setToken(newToken);
              setRetryCount(0);
            } catch (err) {
              console.error("[AuthProvider] Không thể làm mới token:", err.message);
              setRetryCount((prev) => prev + 1);
              setTimeout(verifyToken, 5000); // Thử lại sau 5s
              return;
            }
          }
        } catch (err) {
          console.error("[AuthProvider] Lỗi xác thực token:", err.message);
          setRetryCount((prev) => prev + 1);
          setTimeout(verifyToken, 5000); // Thử lại sau 5s
          return;
        }
      } else {
        console.warn("[AuthProvider] Đạt maxRetries hoặc không có token, xóa token");
        localStorage.removeItem("token");
        setToken(null);
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
        } catch (error) {
          console.error("[AuthProvider] Không thể làm mới token:", error.message);
          setRetryCount((prev) => prev + 1);
        }
      }
    }, 60000);
    return () => clearInterval(refreshInterval);
  }, [authData.isAuthenticated, authData.exp]);

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    console.log("[AuthProvider] Đã đăng xuất");
  };

  const login = (newToken) => {
    localStorage.setItem("token", newToken);
    setToken(newToken);
    console.log("[AuthProvider] Đã đăng nhập với token mới");
  };

  const value = {
    ...authData,
    login,
    logout,
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