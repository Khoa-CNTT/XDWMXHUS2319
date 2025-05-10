import React, { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  userProfile,
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
  const userProfileData = useSelector((state) => state.users.usersProfile);
  const bioInputRef = useRef();

  const [formData, setFormData] = useState({
    fullName: "",
    bio: "",
    profileImage: null,
    backgroundImage: null,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [nameChangeWarning, setNameChangeWarning] = useState(null);

  useEffect(() => {
    if (isOpen && shouldFocusBio && bioInputRef.current) {
      bioInputRef.current.focus();
      onModalOpened();
    }
  }, [isOpen, shouldFocusBio]);

  useEffect(() => {
    if (isOpen) {
      dispatch(userProfile());
    }
  }, [isOpen, dispatch]);

  useEffect(() => {
    if (isOpen && userProfileData) {
      setFormData({
        fullName: userProfileData?.fullName || "",
        bio: userProfileData?.bio || "",
        profileImage: userProfileData?.profilePicture || null,
        backgroundImage: userProfileData?.backgroundPicture || null,
        profileImagePreview: userProfileData?.profilePicture || null,
        backgroundImagePreview: userProfileData?.backgroundPicture || null,
      });

      if (userProfileData?.lastNameUpdated) {
        const lastUpdated = new Date(userProfileData.lastNameUpdated);
        const now = new Date();
        const daysSinceLastChange = (now - lastUpdated) / (1000 * 60 * 60 * 24);
        if (daysSinceLastChange < 7) {
          const daysLeft = Math.ceil(7 - daysSinceLastChange);
          setNameChangeWarning(
            `Bạn chỉ có thể đổi tên sau ${daysLeft} ngày nữa.`
          );
        }
      }
    }
  }, [isOpen, userProfileData]);

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
    e.preventDefault(); // Ngăn hành vi mặc định của form trong quá trình xử lý
    console.log("Form submitted, preventing default reload");

    setLoading(true);
    setError(null);

    try {
      const profileData = new FormData();
      profileData.append("FullName", formData.fullName);
      profileData.append("Bio", formData.bio);

      if (formData.profileImage instanceof File) {
        profileData.append("ProfileImage", formData.profileImage);
      }
      if (formData.backgroundImage instanceof File) {
        profileData.append("BackgroundImage", formData.backgroundImage);
      }

      console.log("Dispatching updateUserProfile");
      const result = await dispatch(updateUserProfile(profileData));

      if (updateUserProfile.fulfilled.match(result)) {
        console.log("Update successful, dispatching userProfile");
        await dispatch(userProfile()); // Cập nhật dữ liệu người dùng
        console.log("Reloading page to fetch updated images");
        window.location.reload(); // Reload trang để lấy hình ảnh từ bài viết
      } else {
        console.log("Update failed:", result.error?.message);
        setError(result.error?.message || "Cập nhật thất bại");
      }
    } catch (err) {
      console.error("Error during update:", err);
      setError(err.message || "Có lỗi xảy ra khi cập nhật");
    } finally {
      console.log("Setting loading to false");
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="edit-profile-modal__overlay">
      <div className="edit-profile-modal">
        <div className="edit-profile-modal__header">
          <h2>Chỉnh sửa trang cá nhân</h2>
          <button className="edit-profile-modal__close" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="edit-profile-modal__content">
          {error && <div className="edit-profile-modal__error">{error}</div>}
          {nameChangeWarning && (
            <div className="edit-profile-modal__warning">
              {nameChangeWarning}
            </div>
          )}

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
                disabled={nameChangeWarning !== null}
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

            <button
              type="submit"
              className="edit-profile-modal__submit"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner"></span>Đang cập nhật...
                </>
              ) : (
                "Cập nhật"
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditProfileModal;
