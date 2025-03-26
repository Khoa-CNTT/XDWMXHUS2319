import { jwtDecode } from "jwt-decode";

import React from "react";
const getUserIdFromToken = () => {
  const token = localStorage.getItem("token");
  if (!token) return null;

  try {
    const decoded = jwtDecode(token);
    return decoded[
      "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"
    ];
  } catch (error) {
    console.error("Token không hợp lệ", error);
    return null;
  }
};
export default getUserIdFromToken;
