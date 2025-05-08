import React, { useState } from "react";
import "../styles/AuthForm.scss";
import logo from "../assets/Logo.png";
import { NavLink } from "react-router-dom";

const AuthForm = ({ type, onSubmit, loading, error }) => {
  const isLogin = type === "login";
  const isForgot = type === "forgotPass";
  const isRegister = type === "register";

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSubmit) {
      onSubmit(e, formData); // Gửi dữ liệu formData lên component cha
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <div className="logo">
          <img src={logo} alt="University Sharing" />
        </div>
        <h2>
          {isLogin ? "Đăng Nhập" : isRegister ? "Đăng Ký" : "Quên Mật Khẩu"}
        </h2>
        <form onSubmit={handleSubmit}>
          {isRegister && (
            <>
              <label>Họ và tên</label>
              <input
                type="text"
                name="name"
                placeholder="Họ và tên"
                required
                onChange={handleChange}
                autoComplete="name"
              />
            </>
          )}

          <label>Email</label>
          <input
            type="email"
            name="email"
            placeholder="Email"
            onChange={handleChange}
            required
            autoComplete="email"
          />

          {!isForgot && (
            <>
              <label>Mật Khẩu</label>
              <input
                type="password"
                name="password"
                value={formData.password || ""}
                placeholder="Mật khẩu"
                onChange={handleChange}
                required
                autoComplete={isLogin ? "current-password" : "new-password"}
              />
            </>
          )}

          {isRegister && (
            <>
              <label>Nhập lại mật khẩu</label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword || ""}
                placeholder="Nhập lại mật khẩu"
                onChange={handleChange}
                required
                autoComplete="new-password"
              />
            </>
          )}

          {error && <p className="text-red-500 mb-4">{error}</p>}

          <div className="options">
            {isRegister && (
              <label>
                <input type="checkbox" name="policyAgreed" required /> Đồng ý
                với chính sách
              </label>
            )}
            {isLogin && <NavLink to="/forgotpassword">Quên mật khẩu?</NavLink>}
            {isForgot && <NavLink to="/login">Quay lại Đăng Nhập</NavLink>}
            <a href="#">Chính sách</a>
          </div>

          <button type="submit" disabled={loading}>
            {loading
              ? "Đang xử lý..."
              : isLogin
              ? "Đăng Nhập"
              : isRegister
              ? "Đăng Ký"
              : "Gửi Email"}
          </button>

          <p>
            {isLogin ? (
              <>
                Nếu bạn chưa có tài khoản thì{" "}
                <NavLink to="/register">Đăng Ký</NavLink>
              </>
            ) : isRegister ? (
              <>
                Đã có tài khoản? <NavLink to="/login">Đăng Nhập</NavLink>
              </>
            ) : (
              <></>
            )}
          </p>
        </form>
      </div>
    </div>
  );
};

export default AuthForm;
