import react, { useState } from "react";
import Avatardefault from "../../assets/AvatarDefault.png";
import moreicon from "../../assets/iconweb/moreIcon.svg";
import "../../styles/Notify.scss";
import Title from "antd/es/skeleton/Title";
import Item from "antd/es/list/Item";
const Allnotify = () => {
  const [notify, setNotify] = useState([
    { id: 1, Title: "92 quảng nôm chồ ae nhé" },
    { id: 2, Title: "43 quảng nôm chồ ae nhé" },
    { id: 3, Title: "thôi kệ đi" },
  ]);
  return (
    <>
      <div className="Notify-all-center">
        <div className="Header-Noti">
          <span>Thông báo</span>
        </div>
        <div className="Action-Notify">
          <button> Đã đọc</button>
          <button> Chưa đọc</button>
        </div>
        {notify.map((Item) => (
          <div key={Item.id} className="Notify-item">
            <img src={Avatardefault}></img>
            <span>{Item.Title} </span>
            <img src={moreicon}></img>
          </div>
        ))}
      </div>
    </>
  );
};
export default Allnotify;
