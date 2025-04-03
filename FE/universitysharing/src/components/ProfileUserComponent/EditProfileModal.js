import React, { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  userProfileDetail,
  updateUserProfile,
} from "../../stores/action/profileActions";
import iconCamera from "../../assets/iconweb/iconCamera.svg";
import "../../styles/ProfileUserView/EditProfileModal.scss";
import avatarDefaut from "../../assets/AvatarDefaultFill.png";
import logoWeb from "../../assets/Logo.png";

const EditProfileModal = ({
  isOpen,
  onClose,
  shouldFocusBio,
  onModalOpened,
}) => {
  const dispatch = useDispatch();
  const usersState = useSelector((state) => state.users) || {};
  const { usersDetail } = usersState;
  const bioInputRef = useRef();

  const [formData, setFormData] = useState({
    fullName: "",
    bio: "",
    phoneNumber: "",
    phoneRelativeNumber: "",
    profileImage: null,
    backgroundImage: null,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen && shouldFocusBio && bioInputRef.current) {
      bioInputRef.current.focus();
      onModalOpened(); // Thông báo đã focus xong
    }
  }, [isOpen, shouldFocusBio]);
  useEffect(() => {
    if (isOpen) {
      dispatch(userProfileDetail());
    }
  }, [isOpen, dispatch]);

  useEffect(() => {
    if (isOpen && usersDetail) {
      setFormData({
        fullName: usersDetail?.fullName || "",
        bio: usersDetail?.bio || "",
        phoneNumber: usersDetail?.phoneNumber || "",
        phoneRelativeNumber: usersDetail?.phoneNumberRelative || "",
        profileImage: usersDetail?.profilePicture || null,
        backgroundImage: usersDetail?.backgroundPicture || null,
        profileImagePreview: usersDetail?.profilePicture || null,
        backgroundImagePreview: usersDetail?.backgroundPicture || null,
      });
    }
  }, [isOpen, usersDetail]);

  const handleImageChange = (event, field) => {
    const file = event.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setFormData((prev) => ({
        ...prev,
        [field]: file,
        [`${field}Preview`]: imageUrl,
      }));
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const profileData = new FormData();

      // Append all fields
      profileData.append("FullName", formData.fullName);
      profileData.append("Bio", formData.bio);
      profileData.append("PhoneNumber", formData.phoneNumber);
      profileData.append("PhoneRelativeNumber", formData.phoneRelativeNumber);

      // Append images only if they're new files
      if (formData.profileImage instanceof File) {
        profileData.append("ProfileImage", formData.profileImage);
      }
      if (formData.backgroundImage instanceof File) {
        profileData.append("BackgroundImage", formData.backgroundImage);
      }

      // Debug: Log FormData contents
      for (let [key, value] of profileData.entries()) {
        console.log(`${key}:`, value);
      }

      const result = await dispatch(updateUserProfile(profileData));

      if (updateUserProfile.fulfilled.match(result)) {
        await dispatch(userProfileDetail());
        window.location.reload(); // Reload lại trang sau khi cập nhật thành công
      } else {
        setError(result.error?.message || "Cập nhật thất bại");
      }
    } catch (err) {
      console.error("Update error:", err);
      setError(err.message || "Có lỗi xảy ra khi cập nhật");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="edit-profile-modal__overlay">
      <div className="edit-profile-modal">
        <div className="edit-profile-modal__header">
          <h2>Chỉnh sửa thông tin</h2>
          <button className="edit-profile-modal__close" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="edit-profile-modal__content">
          {error && <div className="edit-profile-modal__error">{error}</div>}

          <div className="edit-profile-modal__background">
            <img
              src={
                formData.backgroundImagePreview ||
                formData.backgroundImage ||
                logoWeb
              }
              alt="Background"
              className="edit-profile-modal__background-image"
            />
            <div
              className="edit-profile-modal__background-edit-container"
              onClick={() =>
                document.getElementById("background-upload").click()
              }
            >
              <img
                className="edit-profile-modal__edit-background"
                src={iconCamera}
                alt="Edit"
              />
              <span className="edit-profile-modal__edit-background-text">
                Chỉnh sửa ảnh bìa
              </span>
            </div>
            <input
              type="file"
              id="background-upload"
              accept="image/*"
              style={{ display: "none" }}
              onChange={(e) => handleImageChange(e, "backgroundImage")}
            />
          </div>

          <div className="edit-profile-modal__avatar">
            <img
              src={
                formData.profileImagePreview ||
                formData.profileImage ||
                avatarDefaut
              }
              alt="Avatar"
            />
            <button
              className="edit-profile-modal__edit-avatar"
              onClick={() => document.getElementById("profile-upload").click()}
            >
              ✎
            </button>
            <input
              type="file"
              id="profile-upload"
              accept="image/*"
              style={{ display: "none" }}
              onChange={(e) => handleImageChange(e, "profileImage")}
            />
          </div>

          <form onSubmit={handleSubmit}>
            <div className="edit-profile-modal__field">
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                required
                placeholder=" "
              />
              <label>Tên người dùng</label>
            </div>

            <div className="edit-profile-modal__field">
              <input
                ref={bioInputRef}
                type="text"
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                placeholder=" "
              />
              <label>Tiểu sử</label>
            </div>

            <div className="edit-profile-modal__field">
              <input
                type="tel"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
                pattern="[0-9]{10,12}"
                title="Số điện thoại phải có 10-12 chữ số"
                placeholder=" "
              />
              <label>Số điện thoại</label>
            </div>

            <div className="edit-profile-modal__field">
              <input
                type="tel"
                name="phoneRelativeNumber"
                value={formData.phoneRelativeNumber}
                onChange={handleChange}
                pattern="[0-9]{10,12}"
                title="Số điện thoại phải có 10-12 chữ số"
                placeholder=" "
              />
              <label>Số điện thoại liên hệ</label>
            </div>

            <button
              type="submit"
              className="edit-profile-modal__submit"
              disabled={loading}
            >
              {loading ? "Đang cập nhật..." : "Cập nhật"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditProfileModal;
