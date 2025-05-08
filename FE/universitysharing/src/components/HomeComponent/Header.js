import React, { useState, useRef, useEffect } from "react";
import { useSelector } from "react-redux";

import "../../styles/headerHome.scss";
import "../../styles/MoblieReponsive/HomeViewMobile/HeaderHomeReponsive.scss";
import logoweb from "../../assets/Logo.png";
import avatarweb from "../../assets/AvatarDefault.png";
import { useSignalR } from "../../Service/SignalRProvider";

import { FiSearch, FiBell, FiMessageSquare, FiArrowLeft } from "react-icons/fi";

import NotifyModal from "../NotifyModal";
import MessengerModal from "../MessengerModal";
import SettingModal from "../SettingModal";

import { useNavigate } from "react-router-dom";
import { searchPost } from "../../stores/action/searchAction";
import { useDispatch } from "react-redux";
import { fetchUnreadNotificationCount } from "../../stores/action/notificationAction";
import "animate.css";

const Header = ({ usersProfile }) => {
  const [unreadCount, setUnreadCount] = useState(0);
  const dispatch = useDispatch();
  const searchRef = useRef(null);
  const logoRef = useRef(null);
  const rightRef = useRef(null);
  const [searchKeyword, setSearchKeyword] = useState("");
  const navigate = useNavigate();
  const [modalPosition, setModalPosition] = useState({});
  const unreadNotificationCount = useSelector(
    (state) => state.notifications.unreadCount
  );
  const { signalRService } = useSignalR();

  // Fetch unread notification count on component mount
  useEffect(() => {
    dispatch(fetchUnreadNotificationCount());
  }, [dispatch]);

  useEffect(() => {
    const handleUnreadCount = (count) => {
      setUnreadCount(count);
    };

    signalRService.onReceiveUnreadCount(handleUnreadCount);

    return () => {
      // Nếu bạn có hỗ trợ unsubscribe thì thực hiện ở đây
    };
  }, [signalRService]);

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
  useEffect(() => {
    if (modalState.messenger) {
      setUnreadCount(0);
      // TODO: Gọi API đánh dấu tin nhắn là đã đọc
    }
  }, [modalState.messenger]);
  // Add this function to calculate button position
  const getButtonPosition = (buttonId) => {
    const button = document.getElementById(buttonId);
    if (button) {
      const rect = button.getBoundingClientRect();
      return {
        top: rect.bottom + window.scrollY + 5,
        right: window.innerWidth - rect.right - window.scrollX,
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

  //Mở đóng left menu
  const showSearchBox = () => {
    if (window.innerWidth <= 768) {
      searchRef.current?.classList.remove("hide-mobile");
      logoRef.current?.classList.add("hide-mobile");
      rightRef.current?.classList.add("hide-mobile");
    }
  };

  const hideSearchBox = () => {
    if (window.innerWidth <= 768) {
      searchRef.current?.classList.add("hide-mobile");
      logoRef.current?.classList.remove("hide-mobile");
      rightRef.current?.classList.remove("hide-mobile");
    }
  };
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target) &&
        window.innerWidth <= 768
      ) {
        hideSearchBox();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);
  //Mở đóng left menu
  return (
    <>
      <div className="header">
        <div className="logoWeb" ref={logoRef}>
          <img
            className="logowebsite"
            src={logoweb}
            alt="University Sharing"
            onClick={handleHomeView}
          />
          <div className="btn-search" onClick={showSearchBox}>
            <FiSearch className="search-icon-btn"></FiSearch>
          </div>
        </div>

        <div className="search hide-mobile" ref={searchRef}>
          <div className="close-search-btn ">
            <FiArrowLeft className="close-btn-search" onClick={hideSearchBox} />
          </div>
          <form onSubmit={handleSearch} className="search-form ">
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

        <div className="rightHeader" ref={rightRef}>
          <button
            id="messenger-button"
            className={`icon-button ${modalState.messenger ? "active" : ""}`}
            onClick={() => toggleModal("messenger")}
            aria-label="Messenger"
          >
            <FiMessageSquare className="icon" />
            {unreadCount > 0 && <span className="badge">{unreadCount}</span>}
          </button>

          <button
            className={`icon-button ${modalState.notify ? "active" : ""}`}
            onClick={() => toggleModal("notify")}
            aria-label="Notifications"
          >
            <FiBell className="icon" />
            <span className="badge">{unreadNotificationCount}</span>
          </button>

          <button
            className="avatar-button"
            onClick={() => toggleModal("setting")}
            aria-label="User settings"
          >
            <img
              className="avatarweb"
              src={usersProfile?.profilePicture || avatarweb}
              alt="Avatar"
            />
            {/* {modalState.setting && <div className="indicator"></div>} */}
            <div className="indicator"></div>
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
