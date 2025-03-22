import React from "react";
import AuthForm from "../components/AuthForm";
import { toast } from "react-toastify";
import axios from "axios";
import NProgress from "nprogress";
import "nprogress/nprogress.css";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const navigate = useNavigate(); // ✅ Gọi hook đúng vị trí

  const handleLogin = async (e, formData) => {
    e.preventDefault();
    NProgress.start(); // 🔥 Bắt đầu hiển thị loading bar
    try {
      const response = await axios.post(
        "https://localhost:7053/api/Auth/login",

        { email: formData.email, password: formData.password }
      );
      console.log("Phản hồi từ API:", response.data);
      if (response.data.success) {
        localStorage.setItem("token", response.data.data); // Lưu token chính xác
        toast.success("Đăng nhập thành công!");
        navigate("/home"); // ✅ Điều hướng sau khi đăng nhập
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
      NProgress.done(); // 🔥 Kết thúc loading bar
    }
  };

  return <AuthForm type="login" onSubmit={handleLogin} />;
};

export default Login;
