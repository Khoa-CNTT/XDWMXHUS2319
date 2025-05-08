import React, { useState, useEffect } from "react";
import Header from "../components/HomeComponent/Header";
import LeftSidebar from "../components/HomeComponent/LeftSideBarHome";
import YourAccount from "../components/SettingComponent/YourAccount";
import ChangePassword from "../components/SettingComponent/ChangePassword";
import UpdateProfileInfo from "../components/SettingComponent/UpdateProfileInfo";
import "../styles/SettingView.scss";
import { FcNext } from "react-icons/fc";
import { useDispatch, useSelector } from "react-redux";
import { userProfile } from "../stores/action/profileActions";
import "../styles/HomeView.scss";
import "../styles/MoblieReponsive/HomeViewMobile/HomeMobile.scss";

const SettingsView = () => {
  const dispatch = useDispatch();
  const usersState = useSelector((state) => state.users) || {};
  const { users } = usersState;
  const [activeSection, setActiveSection] = useState("Tài khoản của bạn");
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [showUpdateProfileInfo, setShowUpdateProfileInfo] = useState(false);

  useEffect(() => {
    dispatch(userProfile());
  }, [dispatch]);

  const menuItems = ["Tài khoản của bạn", "Trung tâm trợ giúp"];

  const handleMenuClick = (item) => {
    setActiveSection(item);
    setShowChangePassword(false);
    setShowUpdateProfileInfo(false); // Reset showUpdateProfileInfo khi nhấp vào menu item
  };

  const renderContent = () => {
    if (showChangePassword) {
      return <ChangePassword onBack={() => setShowChangePassword(false)} />;
    }
    if (showUpdateProfileInfo) {
      return (
        <UpdateProfileInfo onBack={() => setShowUpdateProfileInfo(false)} />
      );
    }
    switch (activeSection) {
      case "Tài khoản của bạn":
        return (
          <YourAccount
            onChangePassword={() => setShowChangePassword(true)}
            onUpdateProfileInfo={() => setShowUpdateProfileInfo(true)}
          />
        );
      default:
        return <div>{activeSection} content here</div>;
    }
  };

  return (
    <div className="settings-view">
      <Header className="header" usersProfile={users} />
      <div className="settings-container">
        <div className="settings-content">
          <div className="settings-sidebar">
            <h2>Cài đặt</h2>
            <input
              type="text"
              placeholder="Search Settings"
              className="search-input"
            />
            <ul className="menu-list">
              {menuItems.map((item) => (
                <li
                  key={item}
                  className={activeSection === item ? "active" : ""}
                  onClick={() => handleMenuClick(item)}
                >
                  {item} <FcNext />
                </li>
              ))}
            </ul>
          </div>
          <div className="settings-main">{renderContent()}</div>
        </div>
      </div>
    </div>
  );
};

export default SettingsView;
