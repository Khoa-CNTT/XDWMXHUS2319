import React from "react";
import ClipLoader from "react-spinners/ClipLoader";

const Spinner = ({ size = 50, color = "rgb(12, 118, 232)" }) => {
  return (
    <div className="flex items-center justify-center">
      <ClipLoader size={size} color={color} />
    </div>
  );
};

export default Spinner;
