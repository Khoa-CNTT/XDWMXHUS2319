import React from "react";
import "../styles/AccountVerified.scss";
import { useNavigate } from "react-router-dom";

const AccountVerified = () => {
  const navigate = useNavigate();
  const handleContinues = () => {
    console.log("Da bam thanh cong vao cai lo dit cua tk dang");
    navigate("/");
  };
  return (
    <div className="account-verified-container">
      <div className="account-verified-card">
        <div className="header-verify">
          <h1>University Sharing</h1>
        </div>
        <div className="content">
          <div className="icon-container">
            <svg
              className="checkmark"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 52 52"
            >
              <circle
                className="checkmark__circle"
                cx="26"
                cy="26"
                r="25"
                fill="none"
              />
              <path
                className="checkmark__check"
                fill="none"
                d="M14.1 27.2l7.1 7.2 16.7-16.8"
              />
            </svg>
          </div>
          <h2>Tài khoản của bạn đã được xác thực</h2>
          <p>
            Cảm ơn bạn đã xác thực tài khoản. Bây giờ bạn có thể sử dụng đầy đủ
            các tính năng của hệ thống.
          </p>
          <button onClick={handleContinues} className="continue-button">
            Tiếp tục
          </button>
        </div>
      </div>
    </div>
  );
};

export default AccountVerified;
