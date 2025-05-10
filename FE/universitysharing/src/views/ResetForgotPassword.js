import React, { useState, useEffect } from "react";
import "../styles/AuthForm.scss";
import logo from "../assets/Logo.png";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import { useDispatch, useSelector } from "react-redux";
import { resetPassword } from "../stores/action/authAction";

const ResetForgotPassword = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();
  const [token, setToken] = useState("");
  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
    policyAgreed: false,
  });

  const { loading, error } = useSelector((state) => state.auth);

  useEffect(() => {
    const tokenFromUrl = searchParams.get("token");
    if (!tokenFromUrl) {
      toast.error("Liên kết đặt lại mật khẩu không hợp lệ");
      navigate("/login");
      return;
    }
    setToken(tokenFromUrl);
  }, [searchParams, navigate]);

  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
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
      toast.warning("Vui lòng đồng ý với chính sách!");
      return;
    }

    try {
      const result = await dispatch(
        resetPassword({
          Token: token,
          NewPassword: formData.password,
          ConfirmPassword: formData.confirmPassword,
        })
      ).unwrap();

      if (result.success) {
        toast.success("Đã cập nhật mật khẩu thành công!");
        navigate("/login");
      }
    } catch (error) {
      console.error("Lỗi khi đặt lại mật khẩu:", error);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <div className="logo">
          <img src={logo} alt="University Sharing" />
        </div>
        <h2>Chọn mật khẩu mới</h2>
        <form onSubmit={handleSubmit}>
          <label>Mật Khẩu mới</label>
          <input
            type="password"
            name="password"
            placeholder="Mật khẩu mới"
            required
            value={formData.password}
            onChange={handleChange}
            disabled={loading}
            autoComplete="new-password"
          />

          <label>Nhập lại mật khẩu mới</label>
          <input
            type="password"
            name="confirmPassword"
            placeholder="Nhập lại mật khẩu mới"
            required
            value={formData.confirmPassword}
            onChange={handleChange}
            disabled={loading}
            autoComplete="new-password"
          />

          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <label className="policy">
              <input
                type="checkbox"
                name="policyAgreed"
                checked={formData.policyAgreed}
                onChange={handleChange}
                required
                disabled={loading}
              />
              Đồng ý với chính sách
            </label>
            <a href="#" style={{ textDecoration: "none", color: "#1497ff" }}>
              Chính sách
            </a>
          </div>

          <button type="submit" disabled={loading}>
            {loading ? "Đang xử lý..." : "Xác nhận"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetForgotPassword;
