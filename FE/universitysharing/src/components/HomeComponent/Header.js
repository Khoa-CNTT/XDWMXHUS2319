import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import "../../styles/headerHome.scss";
import logoweb from "../../assets/Logo.png";
import avatarweb from "../../assets/AvatarDefault.png";
import searchIcon from "../../assets/iconweb/searchIcon.svg";
import notifyIcon from "../../assets/iconweb/notificationsIcon.svg";
import messengerIcon from "../../assets/iconweb/MessIcon.png";
import NotifyModal from "../NotifyModal";
import MessengerModal from "../MessengerModal";
import SettingModal from "../SettingModal";
import { useLocation, useNavigate } from "react-router-dom"; //Chuyển hướng trang
import { searchPost } from "../../stores/action/searchAction";
import { useDispatch } from "react-redux";

// import { resetApp } from "../../stores/stores";

const Header = ({ usersProfile }) => {
  const dispatch = useDispatch();
  // console.log("Data User truyền xuống: ", usersProfile);
  const [searchKeyword, setSearchKeyword] = useState("");
  const navigate = useNavigate();
  //chuyển hướng
  const UserProfile = () => {
    // navigate("/ProfileUserView");
    window.location.href = "/ProfileUserView";
  };
  const handleHomeView = () => {
    navigate("/home");
  };
  //search cua thanh
  const handleSearch = (e) => {
    e.preventDefault();
    if (searchKeyword.trim()) {
      dispatch(searchPost(searchKeyword));
      navigate(`/ResultSearchView?q=${encodeURIComponent(searchKeyword)}`);
      // Clear the search input after submission if needed
      setSearchKeyword("");
    }
  };

  //Đăng xuất
  const handleLogout = () => {
    // dispatch(resetApp());
    localStorage.removeItem("token");
    window.location.href = "/";
  };
  const [modalState, setModalState] = useState({
    notify: false,
    messenger: false,
    setting: false,
  });

  const toggleModal = (modalName) => {
    setModalState((prev) => ({
      notify: false,
      messenger: false,
      setting: false,
      [modalName]: !prev[modalName], // Chỉ mở modal được click
    }));
  };

  return (
    <>
      <div className="header">
        <div className="logoWeb" onClick={handleHomeView}>
          <img className="logowebsite" src={logoweb} alt="University Sharing" />
        </div>
        <div className="search">
          <form onSubmit={handleSearch} className="search-form">
            <input
              type="text"
              placeholder="Tìm kiếm"
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              className="search-input"
            />
            <button type="submit" className="search-button">
              <img src={searchIcon} alt="Search Icon" className="search-icon" />
            </button>
          </form>
        </div>
        <div className="rightHeader">
          <span onClick={() => toggleModal("messenger")}>
            <img src={messengerIcon} alt="Messenger" />
          </span>
          <span onClick={() => toggleModal("notify")}>
            <img src={notifyIcon} alt="Notifications" />
          </span>
          <span onClick={() => toggleModal("setting")}>
            <img
              className="avatarweb"
              src={usersProfile.profilePicture || avatarweb}
              alt="Avatar"
            />
          </span>
        </div>
      </div>

      {/* Modals */}
      {modalState.notify && (
        <NotifyModal
          isOpen={modalState.notify}
          onClose={() => toggleModal("notify")}
        />
      )}
      {modalState.messenger && (
        <MessengerModal
          isOpen={modalState.messenger}
          onClose={() => toggleModal("messenger")}
          messages={[]}
        />
      )}
      {modalState.setting && (
        <SettingModal
          isOpen={modalState.setting}
          onClose={() => toggleModal("setting")}
          users={usersProfile}
          UserProfile={UserProfile}
          logout={handleLogout}
        />
      )}
    </>
  );
};

export default Header;
