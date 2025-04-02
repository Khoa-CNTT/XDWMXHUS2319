// import React, { useState } from "react";
// import "../../styles/ProfileUserView/EditProfileModal.scss";

// const EditProfileModal = ({ isOpen, onClose, userProfile, onSave }) => {
//   // If the modal is not open, return null to render nothing
//   if (!isOpen) return null;

//   // Initialize form state with user profile data or empty strings
//   const [formData, setFormData] = useState({
//     fullName: userProfile?.fullName || "",
//     bio: userProfile?.bio || "",
//     phoneNumber: userProfile?.phoneNumber || "",
//     contactPhoneNumber: userProfile?.contactPhoneNumber || "",
//   });

//   // Handle input changes
//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFormData((prev) => ({
//       ...prev,
//       [name]: value,
//     }));
//   };

//   // Handle form submission
//   const handleSubmit = (e) => {
//     e.preventDefault();
//     onSave(formData); // Call the onSave function passed as a prop
//     onClose(); // Close the modal after saving
//   };

//   return (
//     <div className="edit-profile-modal__overlay">
//       <div className="edit-profile-modal">
//         <div className="edit-profile-modal__header">
//           <h2>Chỉnh sửa thông tin</h2>
//           <button className="edit-profile-modal__close" onClick={onClose}>
//             ✕
//           </button>
//         </div>
//         <div className="edit-profile-modal__content">
//           <div className="edit-profile-modal__avatar">
//             <img
//               src={
//                 userProfile?.profilePicture ||
//                 "https://i.pinimg.com/originals/4a/7f/73/4a7f73035bb4743ee57c0e351b3c8bed.jpg"
//               }
//               alt="Avatar"
//             />
//             <button className="edit-profile-modal__edit-avatar">✎</button>
//           </div>
//           <form onSubmit={handleSubmit}>
//             <div className="edit-profile-modal__field">
//               <label>Tên người dùng</label>
//               <input
//                 type="text"
//                 name="fullName"
//                 value={formData.fullName}
//                 onChange={handleChange}
//                 placeholder="Nhập tên người dùng"
//               />
//             </div>
//             <div className="edit-profile-modal__field">
//               <label>Chỉnh sửa tiểu sử</label>
//               <input
//                 type="text"
//                 name="bio"
//                 value={formData.bio}
//                 onChange={handleChange}
//                 placeholder="Nhập tiểu sử"
//               />
//             </div>
//             <div className="edit-profile-modal__field">
//               <label>SDT</label>
//               <input
//                 type="text"
//                 name="phoneNumber"
//                 value={formData.phoneNumber}
//                 onChange={handleChange}
//                 placeholder="Nhập số điện thoại"
//               />
//             </div>
//             <div className="edit-profile-modal__field">
//               <label>SDT liên hệ</label>
//               <input
//                 type="text"
//                 name="contactPhoneNumber"
//                 value={formData.contactPhoneNumber}
//                 onChange={handleChange}
//                 placeholder="Nhập số điện thoại liên hệ"
//               />
//             </div>
//             <button type="submit" className="edit-profile-modal__submit">
//               Cập nhật
//             </button>
//           </form>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default EditProfileModal;
