import React, { useState, useEffect } from "react";
import { FaArrowLeft } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import {
  updateUserInformation,
  userProfileDetail,
} from "../../stores/action/profileActions";
import { toast } from "react-toastify";

const UpdateProfileInfo = ({ onBack }) => {
  const dispatch = useDispatch();
  const usersState = useSelector((state) => state.users) || {};
  const { usersDetail } = usersState;

  const [phoneNumber, setPhoneNumber] = useState("");
  const [emergencyContact, setEmergencyContact] = useState("");
  const [gender, setGender] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  // Format số hiển thị (ví dụ: 077 759 9558)
  const formatPhoneNumber = (value) => {
    const digits = value.replace(/[^\d]/g, "");
    if (digits.length <= 3) return digits;
    if (digits.length <= 6) return `${digits.slice(0, 3)} ${digits.slice(3)}`;
    if (digits.length <= 9)
      return `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6)}`;
    return `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6, 10)}`;
  };

  // Chuẩn hóa số cho state và API (thêm 0 nếu thiếu)
  const normalizePhoneNumber = (value) => {
    const digits = value.replace(/[^\d]/g, "");
    return digits.startsWith("0") ? digits : `0${digits}`;
  };

  // Parse số cho API (ví dụ: +84777599558)
  const parsePhoneNumber = (value) => {
    const digits = normalizePhoneNumber(value);
    return `+84${digits.slice(1)}`;
  };

  // Validate số (10 hoặc 11 số, bắt đầu bằng 0)
  const validatePhoneNumber = (value) => {
    const digits = normalizePhoneNumber(value);
    return /^0\d{9,10}$/.test(digits);
  };

  // Xử lý thay đổi input số điện thoại
  const handlePhoneChange10Change = (e) => {
    const value = e.target.value;
    const digits = value.replace(/[^\d]/g, "");
    if (digits.length <= 11) {
      setPhoneNumber(formatPhoneNumber(normalizePhoneNumber(digits)));
    }
  };

  // Xử lý thay đổi input số người thân
  const handleEmergencyContactChange = (e) => {
    const value = e.target.value;
    const digits = value.replace(/[^\d]/g, "");
    if (digits.length <= 11) {
      setEmergencyContact(formatPhoneNumber(normalizePhoneNumber(digits)));
    }
  };

  // Tải thông tin người dùng
  useEffect(() => {
    dispatch(userProfileDetail());
  }, [dispatch]);

  // Cập nhật state khi dữ liệu người dùng thay đổi
  useEffect(() => {
    console.log("User Profile Data (usersDetail):", usersDetail);
    if (usersDetail) {
      const phone = usersDetail?.phoneNumber || usersDetail?.phone || "";
      setPhoneNumber(
        phone.startsWith("+84")
          ? formatPhoneNumber(phone.replace("+84", "0"))
          : formatPhoneNumber(normalizePhoneNumber(phone))
      );
      const emergency =
        usersDetail?.phoneNumberRelative || usersDetail?.phoneRelative || "";
      setEmergencyContact(
        emergency.startsWith("+84")
          ? formatPhoneNumber(emergency.replace("+84", "0"))
          : formatPhoneNumber(normalizePhoneNumber(emergency))
      );
      setGender(usersDetail?.gender || "");
    }
  }, [usersDetail]);

  // Xử lý submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsProcessing(true);

    // Validate số điện thoại
    if (!validatePhoneNumber(phoneNumber)) {
      toast.error("Số điện thoại phải bắt đầu bằng 0 và có 10 hoặc 11 số!", {
        position: "top-right",
        autoClose: 3000,
      });
      setIsProcessing(false);
      return;
    }

    // Validate số người thân
    if (!validatePhoneNumber(emergencyContact)) {
      toast.error("Số người thân phải bắt đầu bằng 0 và có 10 hoặc 11 số!", {
        position: "top-right",
        autoClose: 3000,
      });
      setIsProcessing(false);
      return;
    }

    try {
      const updatedData = {
        phoneNumber: parsePhoneNumber(phoneNumber),
        phoneRelative: parsePhoneNumber(emergencyContact),
        gender,
      };

      const result = await dispatch(
        updateUserInformation(updatedData)
      ).unwrap();

      toast.success("Cập nhật thông tin thành công!", {
        position: "top-right",
        autoClose: 3000,
      });

      setTimeout(() => {
        dispatch(userProfileDetail());
        onBack();
      }, 3000);
    } catch (error) {
      const errorMessage = error || "Đã xảy ra lỗi không xác định";
      if (errorMessage === "Invalid phone number") {
        toast.error("Số điện thoại không hợp lệ!", {
          position: "top-right",
          autoClose: 3000,
        });
      } else if (errorMessage === "Invalid emergency contact") {
        toast.error("Số điện thoại người thân không hợp lệ!", {
          position: "top-right",
          autoClose: 3000,
        });
      } else if (errorMessage === "User not found") {
        toast.error("Người dùng không tồn tại!", {
          position: "top-right",
          autoClose: 3000,
        });
      } else if (errorMessage === "User not authenticated") {
        toast.error("Người dùng chưa xác thực!", {
          position: "top-right",
          autoClose: 3000,
        });
      } else {
        toast.error("Đã xảy ra lỗi: " + errorMessage, {
          position: "top-right",
          autoClose: 3000,
        });
      }
      setIsProcessing(false);
    }
  };

  return (
    <div className="update-profile-info">
      {" "}
      <button className="back-button" onClick={onBack}>
        {" "}
        <FaArrowLeft />{" "}
      </button>{" "}
      <h2>Cập nhật thông tin</h2>{" "}
      <form onSubmit={handleSubmit} className="form-container">
        {" "}
        <div className="form-group">
          {" "}
          <label>Số điện thoại</label>{" "}
          <div className="phone-input-wrapper">
            {" "}
            <span className="phone-prefix">+84</span>{" "}
            <input
              type="text"
              value={phoneNumber}
              onChange={handlePhoneChange10Change}
              required
              placeholder="077 759 9558"
              pattern="^0\d{2} \d{3} \d{3,4}$"
            />{" "}
          </div>{" "}
        </div>{" "}
        <div className="form-group">
          {" "}
          <label>Số người thân</label>{" "}
          <div className="phone-input-wrapper">
            {" "}
            <span className="phone-prefix">+84</span>{" "}
            <input
              type="text"
              value={emergencyContact}
              onChange={handleEmergencyContactChange}
              required
              placeholder="077 759 9558"
              pattern="^0\d{2} \d{3} \d{3,4}$"
            />{" "}
          </div>{" "}
        </div>{" "}
        <div className="form-group">
          {" "}
          <label>Giới tính</label>{" "}
          <select
            value={gender}
            onChange={(e) => setGender(e.target.value)}
            required
          >
            {" "}
            <option value="" disabled>
              {" "}
              Chọn giới tính{" "}
            </option>{" "}
            <option value="Nam">Nam</option> <option value="Nữ">Nữ</option>{" "}
            <option value="Khác">Khác</option>{" "}
          </select>{" "}
        </div>{" "}
        <button type="submit" className="save-button" disabled={isProcessing}>
          {" "}
          {isProcessing ? "Đang xử lý..." : "Lưu"}{" "}
        </button>{" "}
      </form>{" "}
    </div>
  );
};

export default UpdateProfileInfo;
