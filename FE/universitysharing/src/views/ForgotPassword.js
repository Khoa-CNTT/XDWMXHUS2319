import React from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import AuthForm from "../components/AuthForm";
import { forgotPassword } from "../stores/action/authAction";

const ForgotPass = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { loading, error } = useSelector((state) => state.auth);

  const handleForgotPassword = async (e, formData) => {
    e.preventDefault();
    const email = formData.email;
    console.log("Email value on submit:", email); // Debug khi submit
    if (
      !email ||
      !/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email)
    ) {
      toast.error("Vui lòng nhập email hợp lệ");
      return;
    }
    try {
      console.log("Dispatching forgotPassword with email:", email);
      await dispatch(forgotPassword(email)).unwrap();
      toast.success("Email khôi phục đã được gửi!");
      navigate("/login");
    } catch (err) {
      console.error("Forgot password error:", err);
      toast.error(err.message || "Không thể gửi email khôi phục");
    }
  };

  return (
    <AuthForm
      type="forgotPass"
      onSubmit={handleForgotPassword}
      loading={loading}
      error={error}
    />
  );
};

export default ForgotPass;
