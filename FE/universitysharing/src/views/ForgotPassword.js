import React, { useState } from "react";
import AuthForm from "../components/AuthForm";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
const ForgotPass = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const handleForgotPassword = (e) => {
    e.preventDefault();
    //Giả lập sau sẽ đưa API vào
    setTimeout(() => {
      toast.success("Email khôi phục đã được gửi!");
      navigate("/login"); // Chuyển hướng về trang đăng nhập
    }, 2000);
  };
  return (
    <AuthForm
      type="forgotPass"
      onSubmit={handleForgotPassword}
      onEmailChange={(e) => setEmail(e.target.value)}
    />
  );
};

export default ForgotPass;
