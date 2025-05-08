import React, { useState } from "react";
import "../../styles/headerHome.scss";
import CreateRidePost from "../RideComponent/CreateRidePost";

const InputCreateRide = ({ usersProfile }) => {
  const [isOpenModal, setOpenModal] = useState(false);
  const openModal = () => {
    setOpenModal(true);
  };
  const closeModal = () => {
    setOpenModal(false);
  };
  return (
    <>
      <div className="post-input" onClick={() => openModal()}>
        <input type="text" readOnly placeholder="Bạn muốn đi đâu nào!" />
        <button>Đăng</button>
      </div>
      {isOpenModal && (
        <CreateRidePost
          onClose={() => closeModal()}
          usersProfile={usersProfile}
        />
      )}
    </>
  );
};

export default InputCreateRide;
