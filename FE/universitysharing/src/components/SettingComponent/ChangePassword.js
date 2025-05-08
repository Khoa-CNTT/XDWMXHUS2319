import React, { useState } from "react";
import { FaArrowLeft, FaEye, FaEyeSlash } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import { changePassword } from "../../stores/action/authAction";
import { clearAuthState } from "../../stores/reducers/authReducer";
import { toast } from "react-toastify";

const ChangePassword = ({ onBack }) => {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const dispatch = useDispatch();
  const { loading } = useSelector((state) => state.auth);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsProcessing(true); // Đặt trạng thái nút thành "Đang xử lý..."
    try {
      // Gọi action và chờ kết quả
      await dispatch(
        changePassword({
          oldPassword: currentPassword,
          newPassword,
          confirmPassword,
        })
      ).unwrap(); // unwrap() để lấy kết quả trực tiếp từ action

      // Nếu không có lỗi, hiển thị toast thành công
      toast.success("Đổi mật khẩu thành công!", {
        position: "top-right",
        autoClose: 3000,
      });
      setTimeout(() => {
        dispatch(clearAuthState());
        onBack();
      }, 3000);
    } catch (error) {
      // Xử lý lỗi từ backend
      const errorMessage = error || "Đã xảy ra lỗi không xác định";
      if (errorMessage === "Incorrect old password") {
        toast.error("Mật khẩu cũ không chính xác!", {
          position: "top-right",
          autoClose: 3000,
        });
      } else if (errorMessage === "New passwords do not match") {
        toast.error("Mật khẩu mới và xác nhận không khớp!", {
          position: "top-right",
          autoClose: 3000,
        });
      } else if (
        errorMessage ===
        "The new password must not be the same as the old password"
      ) {
        toast.error("Mật khẩu mới không được trùng với mật khẩu cũ", {
          position: "top-right",
          autoClose: 3000,
        });
      } else if (errorMessage === "User not authenticated") {
        toast.error("Người dùng chưa xác thực!", {
          position: "top-right",
          autoClose: 3000,
        });
      } else if (errorMessage === "User not found") {
        toast.error("Người dùng không tồn tại!", {
          position: "top-right",
          autoClose: 3000,
        });
      } else {
        toast.error("Đã xảy ra lỗi: " + errorMessage, {
          position: "top-right",
          autoClose: 3000,
        });
      }
      setIsProcessing(false); // Nếu thất bại, chuyển nút về "Lưu"
      dispatch(clearAuthState());
    }
  };

  return (
    <div className="change-password">
      <button className="back-button" onClick={onBack}>
        <FaArrowLeft />
      </button>
      <h2>Thay đổi mật khẩu</h2>
      <form onSubmit={handleSubmit} className="form-container">
        <div className="form-group">
          <label>Mật khẩu cũ</label>
          <div className="password-input-wrapper">
            <input
              type={showCurrentPassword ? "text" : "password"}
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
            />
            <span
              className="password-toggle"
              onClick={() => setShowCurrentPassword(!showCurrentPassword)}
            >
              {showCurrentPassword ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>
          <a href="/forgot-password" className="forgot-password">
            Quên mật khẩu?
          </a>
        </div>
        <div className="form-group">
          <label>Mật khẩu mới</label>
          <div className="password-input-wrapper">
            <input
              type={showNewPassword ? "text" : "password"}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
            <span
              className="password-toggle"
              onClick={() => setShowNewPassword(!showNewPassword)}
            >
              {showNewPassword ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>
        </div>
        <div className="form-group">
          <label>Xác nhận mật khẩu</label>
          <div className="password-input-wrapper">
            <input
              type={showConfirmPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
            <span
              className="password-toggle"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>
        </div>
        <button
          type="submit"
          className="save-button"
          disabled={loading || isProcessing}
        >
          {isProcessing ? "Đang xử lý..." : "Lưu"}
        </button>
      </form>
    </div>
  );
};

export default ChangePassword;
