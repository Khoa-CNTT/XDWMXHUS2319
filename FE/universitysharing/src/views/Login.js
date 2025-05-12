import React, { useEffect, useState } from "react";
import AuthForm from "../components/AuthForm";
import { toast } from "react-toastify";
import axiosClient from "../Service/axiosClient";
import NProgress from "nprogress";
import "nprogress/nprogress.css";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { jwtDecode } from "jwt-decode";

const Login = () => {
  const navigate = useNavigate();
  const { login, isAuthenticated, userRole, isLoading, isTokenVerified } =
    useAuth();
  const [loginSuccess, setLoginSuccess] = useState(false);

  const handleLogin = async (e, formData) => {
    e.preventDefault();
    NProgress.start();

    try {
      const response = await axiosClient.post("/api/Auth/login", {
        email: formData.email,
        password: formData.password,
      });

      if (response.data.success) {
        const token = response.data.data;

        login(token);
        console.warn("[Login] Decoded token:", userRole);
        toast.success("Đăng nhập thành công!");
        setLoginSuccess(true);
      } else if (response?.data?.message?.toLowerCase() === "user not found") {
        toast.error("Người dùng không tồn tại trong hệ thống!");
      } else {
        toast.error("Đăng nhập thất bại!");
      }
    } catch (error) {
      console.error("Lỗi khi gửi request:", error);
      if (error.response?.data?.message === "Email is not verified") {
        toast.error("Tài khoản chưa được xác thực!");
      } else if (error.response?.data?.message === "User not found") {
        toast.error("Tài khoản chưa tồn tại trên hệ thống");
      } else {
        toast.error("Đăng nhập thất bại!");
      }
    } finally {
      NProgress.done();
    }
  };

  useEffect(() => {
    if (loginSuccess && isAuthenticated && !isLoading && isTokenVerified) {
      console.warn("useEffect Login:", { isAuthenticated, userRole });
      if (userRole && userRole.toLowerCase() === "admin") {
        navigate("/admin/dashboard", {
          state: { fromLogin: true },
          replace: true,
        });
      } else {
        navigate("/home", { state: { fromLogin: true }, replace: true });
      }
    }
  }, [
    loginSuccess,
    isAuthenticated,
    userRole,
    isLoading,
    isTokenVerified,
    navigate,
  ]);

  return <AuthForm type="login" onSubmit={handleLogin} />;
};

export default Login;
