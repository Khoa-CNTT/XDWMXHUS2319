import React from "react";
import AuthForm from "../components/AuthForm";
import { toast } from "react-toastify";
import axiosClient from "../Service/axiosClient"; // Thay axios bằng axiosClient
import NProgress from "nprogress";
import "nprogress/nprogress.css";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const baseUrl = process.env.REACT_APP_BASE_URL;

  const handleLogin = async (e, formData) => {
    e.preventDefault();
    NProgress.start();

    try {
      const response = await axiosClient.post("/api/Auth/login", {
        // Gọi API tương đối vì baseURL đã được thiết lập
        email: formData.email,
        password: formData.password,
      });

      if (response.data.success) {
        login(response.data.data);
        toast.success("Đăng nhập thành công!");
        navigate("/home");
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

  return <AuthForm type="login" onSubmit={handleLogin} />;
};

export default Login;