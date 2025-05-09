import React from "react";
import { FaUser, FaKey } from "react-icons/fa";
import { FcNext } from "react-icons/fc";
import { RiInformation2Fill } from "react-icons/ri";

const YourAccount = ({ onChangePassword, onUpdateProfileInfo }) => {
  return (
    <div className="your-account">
      <h2>Tài khoản của bạn</h2>
      <p>Xem thông tin về tài khoản và các tùy chọn bảo mật của bạn.</p>
      <ul className="account-options">
        <li>
          <FaUser className="icon" />
          <div className="option-content">
            <span className="option-title">Thông tin tài khoản</span>
            <span className="option-description">
              Xem thông tin tài khoản của bạn như số điện thoại và địa chỉ
              Email.
            </span>
          </div>
          <FcNext />
        </li>
        <li onClick={onChangePassword}>
          <FaKey className="icon" />
          <div className="option-content">
            <span className="option-title">Đổi mật khẩu</span>
            <span className="option-description">
              Thay đổi mật khẩu của bạn bất cứ lúc nào.
            </span>
          </div>
          <FcNext />
        </li>
        <li onClick={onUpdateProfileInfo}>
          <RiInformation2Fill className="icon" />
          <div className="option-content">
            <span className="option-title">Cập nhật thông tin</span>
            <span className="option-description">
              Cập nhật thông tin để bảo vệ quyền lợi của mình
            </span>
          </div>
          <FcNext />
        </li>
      </ul>
    </div>
  );
};

export default YourAccount;
