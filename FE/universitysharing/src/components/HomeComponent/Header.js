import React, { useState } from "react";
import { useSelector } from "react-redux";
import "../../styles/headerHome.scss";
import logoweb from "../../assets/Logo.png";
import avatarweb from "../../assets/AvatarDefault.png";

import {
  FiSearch,
  FiBell,
  FiMessageSquare,
  FiChevronDown,
  FiX,
  FiHome,
} from "react-icons/fi";
import NotifyModal from "../NotifyModal";
import MessengerModal from "../MessengerModal";
import SettingModal from "../SettingModal";

import { useLocation, useNavigate } from "react-router-dom";
import { searchPost } from "../../stores/action/searchAction";
import { useDispatch } from "react-redux";

const Header = ({ usersProfile }) => {
  const dispatch = useDispatch();
  const [searchKeyword, setSearchKeyword] = useState("");
  const navigate = useNavigate();
  const [modalPosition, setModalPosition] = useState({});
  const UserProfile = () => {

    navigate("/ProfileUserView");
    // window.location.href = "/ProfileUserView";

  };

  const handleHomeView = () => {
    navigate("/home");
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchKeyword.trim()) {
      dispatch(searchPost(searchKeyword));
      navigate(`/ResultSearchView?q=${encodeURIComponent(searchKeyword)}`);
      setSearchKeyword("");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/";
  };

  const [modalState, setModalState] = useState({
    notify: false,
    messenger: false,
    setting: false,
  });
  // Add this function to calculate button position
  const getButtonPosition = (buttonId) => {
    const button = document.getElementById(buttonId);
    if (button) {
      const rect = button.getBoundingClientRect();
      return {
        top: rect.bottom + window.scrollY + 5,
        right: window.innerWidth - rect.right - window.scrollX
      };
    }
    return {};
  };
// Sửa hàm toggle để không đóng các modal khác
const toggleModal = (modalName) => {
  if (!modalState[modalName]) {
    setModalPosition(getButtonPosition(`${modalName}-button`));
  }
  setModalState((prev) => ({
    ...prev,
    [modalName]: !prev[modalName],
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
            <div className="search-container">
              <FiSearch className="search-icon" />
              <input
                type="text"
                placeholder="Tìm kiếm"
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                className="search-input"
              />
            </div>
          </form>
        </div>
        
        <div className="rightHeader">
        <button 
            id="messenger-button"
            className={`icon-button ${modalState.messenger ? 'active' : ''}`}
            onClick={() => toggleModal("messenger")}
            aria-label="Messenger"
          >
            <FiMessageSquare className="icon" />
            {modalState.messenger && <div className="indicator"></div>}
          </button>
          
          <button 
            className={`icon-button ${modalState.notify ? 'active' : ''}`}
            onClick={() => toggleModal("notify")}
            aria-label="Notifications"
          >
            <FiBell className="icon" />
            <span className="badge">3</span>
          </button>
          
          <button 
            className="avatar-button"
            onClick={() => toggleModal("setting")}
            aria-label="User settings"
          >
            <img
              className="avatarweb"
              src={usersProfile.profilePicture || avatarweb}
              alt="Avatar"
            />
            {modalState.setting && <div className="indicator"></div>}
          </button>
        </div>
      </div>

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
          position={modalPosition}
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