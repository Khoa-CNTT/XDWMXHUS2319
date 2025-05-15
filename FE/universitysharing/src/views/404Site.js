// import React from "react";
// import { useNavigate } from "react-router-dom";
// import "../styles/Error404.scss";

// const Site404 = () => {
//   const navigate = useNavigate();
//   const handleHome = () => {
//     navigate("/home");
//   };
//   return (
//     <>
//       <div className="404">404 Error</div>
//       <div className="notify">Đường dẫn không tồn tại!</div>
//       <div
//         className="backHome"
//         onClick={() => {
//           handleHome();
//         }}
//       >
//         Trở lại Home
//       </div>
//     </>
//   );
// };
// export default Site404;

import React from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Error404.scss";

const Site404 = () => {
  const navigate = useNavigate();
  const handleHome = () => {
    navigate("/home");
  };
  return (
    <div className="site-404">
      <div className="error-404">404 Error</div>
      <div className="notify">Đường dẫn không tồn tại!</div>
      <button className="backHome" onClick={handleHome}>
        Trở lại Home
      </button>
    </div>
  );
};
export default Site404;
