import React, { useState } from "react";
import "../styles/AuthForm.scss";
import logo from "../assets/Logo.png";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const ResetForgotPassword = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    policyAgreed: false,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast.error("Mật khẩu nhập lại không khớp!");
      setFormData((prev) => ({
        ...prev,
        password: "",
        confirmPassword: "",
      }));

      return;
    }

    if (!formData.policyAgreed) {
      toast.warning("Mật khẩu nhập lại không khớp!");
      return;
    }

    console.log("Đặt lại mật khẩu thành công:", formData);
    // test thử với chưa có API
    setTimeout(() => {
      toast.success("Đã cập nhật mật khẩu thành công!");
      navigate("/login");
    }, 1000);
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <div className="logo">
          <img src={logo} alt="University Sharing" />
        </div>
        <h2>Quên Mật Khẩu</h2>
        <form onSubmit={handleSubmit}>
          <label>Email</label>
          <input
            type="email"
            name="email"
            placeholder="Email"
            required
            value={formData.email}
            onChange={handleChange}
          />

          <label>Mật Khẩu mới</label>
          <input
            type="password"
            name="password"
            placeholder="Mật khẩu mới"
            required
            value={formData.password}
            onChange={handleChange}
          />

          <label>Nhập lại mật khẩu mới</label>
          <input
            type="password"
            name="confirmPassword"
            placeholder="Nhập lại mật khẩu mới"
            required
            value={formData.confirmPassword}
            onChange={handleChange}
          />
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <label className="policy">
              <input
                type="checkbox"
                name="policyAgreed"
                checked={formData.policyAgreed}
                onChange={handleChange}
                required
              />{" "}
              Đồng ý với chính sách
            </label>
            <a href="#" style={{ textDecoration: "none", color: "#1497ff" }}>
              Chính sách
            </a>
          </div>
          <button type="submit">Xác nhận</button>
        </form>
      </div>
    </div>
  );
};

export default ResetForgotPassword;
